using Microsoft.Extensions.Configuration;

namespace EducationPortal.Tests.Selenium.Config;

public class TestSettings
{
    public string BaseUrl { get; set; } = "http://localhost:3000";
    public string ApiUrl { get; set; } = "http://localhost:5000";
    public string Browser { get; set; } = "chrome";
    public bool Headless { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 30;
    public int PollingIntervalMs { get; set; } = 250;
    public int ImplicitWaitSeconds { get; set; } = 5;
    public string UserEmail { get; set; } = string.Empty;
    public string UserPassword { get; set; } = "TestUser@123!";
    public string UserFirstName { get; set; } = "Test";
    public string UserLastName { get; set; } = "User";
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
    public bool ScreenshotOnFailure { get; set; } = true;
    public string ScreenshotDirectory { get; set; } = "TestResults/Screenshots";

    public TimeSpan Timeout => TimeSpan.FromSeconds(TimeoutSeconds);
    public TimeSpan PollingInterval => TimeSpan.FromMilliseconds(PollingIntervalMs);

    private static TestSettings? _instance;
    private static readonly object _lock = new();

    public static TestSettings Instance
    {
        get
        {
            if (_instance is not null) return _instance;
            lock (_lock)
            {
                _instance ??= Load();
            }
            return _instance;
        }
    }

    private static TestSettings Load()
    {
        var env = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";

        var config = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddJsonFile("appsettings.ci.json", optional: true)
            .AddEnvironmentVariables("SELENIUM_")
            .Build();

        var settings = new TestSettings();
        config.GetSection("TestSettings").Bind(settings);

        ApplyEnvironmentOverrides(settings);

        return settings;
    }

    private static void ApplyEnvironmentOverrides(TestSettings settings)
    {
        var baseUrl = Environment.GetEnvironmentVariable("SELENIUM_BASE_URL");
        if (!string.IsNullOrEmpty(baseUrl)) settings.BaseUrl = baseUrl.TrimEnd('/');

        var apiUrl = Environment.GetEnvironmentVariable("SELENIUM_API_URL");
        if (!string.IsNullOrEmpty(apiUrl)) settings.ApiUrl = apiUrl.TrimEnd('/');

        var browser = Environment.GetEnvironmentVariable("SELENIUM_BROWSER");
        if (!string.IsNullOrEmpty(browser)) settings.Browser = browser;

        var headless = Environment.GetEnvironmentVariable("SELENIUM_HEADLESS");
        if (bool.TryParse(headless, out var h)) settings.Headless = h;

        var userEmail = Environment.GetEnvironmentVariable("SELENIUM_USER_EMAIL");
        if (!string.IsNullOrEmpty(userEmail)) settings.UserEmail = userEmail;

        var userPassword = Environment.GetEnvironmentVariable("SELENIUM_USER_PASSWORD");
        if (!string.IsNullOrEmpty(userPassword)) settings.UserPassword = userPassword;

        var adminEmail = Environment.GetEnvironmentVariable("SELENIUM_ADMIN_EMAIL");
        if (!string.IsNullOrEmpty(adminEmail)) settings.AdminEmail = adminEmail;

        var adminPassword = Environment.GetEnvironmentVariable("SELENIUM_ADMIN_PASSWORD");
        if (!string.IsNullOrEmpty(adminPassword)) settings.AdminPassword = adminPassword;

        var timeout = Environment.GetEnvironmentVariable("SELENIUM_TIMEOUT");
        if (int.TryParse(timeout, out var t)) settings.TimeoutSeconds = t;
    }
}
