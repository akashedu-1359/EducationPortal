using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EducationPortal.Tests.Selenium.Config;

namespace EducationPortal.Tests.Selenium.Helpers;

public class ApiHelper : IDisposable
{
    private readonly HttpClient _frontendClient;
    private readonly HttpClient _backendClient;
    private readonly TestSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions;
    private string? _accessToken;

    private const int MaxRetries = 3;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(2);

    public ApiHelper(TestSettings? settings = null)
    {
        _settings = settings ?? TestSettings.Instance;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        _frontendClient = CreateClient(_settings.BaseUrl);
        _backendClient = CreateClient(_settings.ApiUrl);
    }

    private static HttpClient CreateClient(string baseUrl)
    {
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (_, _, _, _) => true,
            AllowAutoRedirect = false,
            UseCookies = true
        };

        var client = new HttpClient(handler)
        {
            BaseAddress = new Uri(baseUrl.TrimEnd('/')),
            Timeout = TimeSpan.FromSeconds(30)
        };

        client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

        return client;
    }

    // Health check
    public async Task<bool> CheckFrontendHealthAsync()
    {
        return await RetryAsync(async () =>
        {
            var response = await _frontendClient.GetAsync("/api/health");
            return response.IsSuccessStatusCode;
        });
    }

    public async Task<bool> CheckBackendHealthAsync()
    {
        return await RetryAsync(async () =>
        {
            var response = await _backendClient.GetAsync("/api/health");
            return response.IsSuccessStatusCode;
        });
    }

    // Auth - Register via backend API
    public async Task<ApiResponse?> RegisterAsync(string firstName, string lastName,
        string email, string password)
    {
        var payload = new { firstName, lastName, email, password };
        var response = await PostAsync(_backendClient, "/api/auth/register", payload);
        if (response?.Data?.TryGetProperty("accessToken", out var token) == true)
        {
            _accessToken = token.GetString();
        }
        return response;
    }

    // Auth - Login via backend API
    public async Task<ApiResponse?> LoginAsync(string email, string password)
    {
        var payload = new { email, password };
        var response = await PostAsync(_backendClient, "/api/auth/login", payload);
        if (response?.Data?.TryGetProperty("accessToken", out var token) == true)
        {
            _accessToken = token.GetString();
        }
        return response;
    }

    // Auth - Login via frontend proxy (sets cookies)
    public async Task<ApiResponse?> LoginViaFrontendAsync(string email, string password)
    {
        var payload = new { email, password };
        var response = await PostAsync(_frontendClient, "/api/auth/login", payload);
        if (response?.Data?.TryGetProperty("accessToken", out var token) == true)
        {
            _accessToken = token.GetString();
        }
        return response;
    }

    // Auth - Register via frontend proxy
    public async Task<ApiResponse?> RegisterViaFrontendAsync(string firstName, string lastName,
        string email, string password)
    {
        var payload = new { firstName, lastName, email, password };
        var response = await PostAsync(_frontendClient, "/api/auth/register", payload);
        if (response?.Data?.TryGetProperty("accessToken", out var token) == true)
        {
            _accessToken = token.GetString();
        }
        return response;
    }

    // Generic GET
    public async Task<ApiResponse?> GetAsync(string endpoint, bool useBackend = true)
    {
        var client = useBackend ? _backendClient : _frontendClient;
        return await RetryAsync(async () =>
        {
            var request = CreateRequest(HttpMethod.Get, endpoint);
            var response = await client.SendAsync(request);
            return await ParseResponseAsync(response);
        });
    }

    // Generic POST
    public async Task<ApiResponse?> PostAsync<T>(string endpoint, T payload, bool useBackend = true)
    {
        var client = useBackend ? _backendClient : _frontendClient;
        return await PostAsync(client, endpoint, payload);
    }

    // Generic PUT
    public async Task<ApiResponse?> PutAsync<T>(string endpoint, T payload, bool useBackend = true)
    {
        var client = useBackend ? _backendClient : _frontendClient;
        return await RetryAsync(async () =>
        {
            var request = CreateRequest(HttpMethod.Put, endpoint);
            request.Content = JsonContent.Create(payload, options: _jsonOptions);
            var response = await client.SendAsync(request);
            return await ParseResponseAsync(response);
        });
    }

    // Generic DELETE
    public async Task<ApiResponse?> DeleteAsync(string endpoint, bool useBackend = true)
    {
        var client = useBackend ? _backendClient : _frontendClient;
        return await RetryAsync(async () =>
        {
            var request = CreateRequest(HttpMethod.Delete, endpoint);
            var response = await client.SendAsync(request);
            return await ParseResponseAsync(response);
        });
    }

    // Raw HTTP status check
    public async Task<HttpStatusCode> GetStatusCodeAsync(string endpoint, bool useBackend = true)
    {
        var client = useBackend ? _backendClient : _frontendClient;
        try
        {
            var request = CreateRequest(HttpMethod.Get, endpoint);
            var response = await client.SendAsync(request);
            return response.StatusCode;
        }
        catch
        {
            return HttpStatusCode.ServiceUnavailable;
        }
    }

    // Token management
    public void SetAccessToken(string token) => _accessToken = token;

    public string? GetAccessToken() => _accessToken;

    public void ClearAccessToken() => _accessToken = null;

    // Private helpers
    private async Task<ApiResponse?> PostAsync<T>(HttpClient client, string endpoint, T payload)
    {
        return await RetryAsync(async () =>
        {
            var request = CreateRequest(HttpMethod.Post, endpoint);
            request.Content = JsonContent.Create(payload, options: _jsonOptions);
            var response = await client.SendAsync(request);
            return await ParseResponseAsync(response);
        });
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string endpoint)
    {
        var request = new HttpRequestMessage(method, endpoint);
        if (!string.IsNullOrEmpty(_accessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        }
        return request;
    }

    private async Task<ApiResponse> ParseResponseAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();

        try
        {
            var json = JsonSerializer.Deserialize<JsonElement>(body, _jsonOptions);
            return new ApiResponse
            {
                StatusCode = response.StatusCode,
                IsSuccess = response.IsSuccessStatusCode,
                Data = json.TryGetProperty("data", out var data) ? data : json,
                Message = json.TryGetProperty("message", out var msg) ? msg.GetString() : null,
                RawBody = body
            };
        }
        catch
        {
            return new ApiResponse
            {
                StatusCode = response.StatusCode,
                IsSuccess = response.IsSuccessStatusCode,
                RawBody = body
            };
        }
    }

    private static async Task<T> RetryAsync<T>(Func<Task<T>> action)
    {
        Exception? lastException = null;

        for (int attempt = 0; attempt < MaxRetries; attempt++)
        {
            try
            {
                return await action();
            }
            catch (HttpRequestException ex)
            {
                lastException = ex;
                if (attempt < MaxRetries - 1)
                    await Task.Delay(RetryDelay * (attempt + 1));
            }
            catch (TaskCanceledException ex)
            {
                lastException = ex;
                if (attempt < MaxRetries - 1)
                    await Task.Delay(RetryDelay * (attempt + 1));
            }
        }

        throw lastException ?? new Exception("Retry failed without exception");
    }

    public void Dispose()
    {
        _frontendClient.Dispose();
        _backendClient.Dispose();
        GC.SuppressFinalize(this);
    }
}

public class ApiResponse
{
    public HttpStatusCode StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public JsonElement? Data { get; set; }
    public string? Message { get; set; }
    public string? RawBody { get; set; }

    public T? Deserialize<T>(JsonSerializerOptions? options = null)
    {
        if (Data is null) return default;
        var json = Data.Value.GetRawText();
        return JsonSerializer.Deserialize<T>(json, options ?? new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
