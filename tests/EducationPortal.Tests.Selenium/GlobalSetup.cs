using NUnit.Framework;
using EducationPortal.Tests.Selenium.Config;
using EducationPortal.Tests.Selenium.Helpers;

namespace EducationPortal.Tests.Selenium;

[SetUpFixture]
public class GlobalSetup
{
    private static TestSettings _settings = null!;

    public static string TestUserEmail { get; private set; } = string.Empty;
    public static string TestUserPassword { get; private set; } = string.Empty;
    public static string AdminEmail { get; private set; } = string.Empty;
    public static string AdminPassword { get; private set; } = string.Empty;
    public static bool IsBackendAvailable { get; private set; }
    public static bool IsFrontendAvailable { get; private set; }

    [OneTimeSetUp]
    public async Task RunBeforeAllTests()
    {
        _settings = TestSettings.Instance;

        TestContext.WriteLine("=== Selenium Test Suite – Global Setup ===");
        TestContext.WriteLine($"Frontend URL: {_settings.BaseUrl}");
        TestContext.WriteLine($"Backend URL:  {_settings.ApiUrl}");
        TestContext.WriteLine($"Browser:      {_settings.Browser}");
        TestContext.WriteLine($"Headless:     {_settings.Headless}");
        TestContext.WriteLine($"Timeout:      {_settings.TimeoutSeconds}s");
        TestContext.WriteLine();

        await WarmUpServices();
        await EnsureTestAccounts();

        TestContext.WriteLine();
        TestContext.WriteLine("=== Global Setup Complete ===");
        TestContext.WriteLine($"Test User:  {TestUserEmail}");
        TestContext.WriteLine($"Admin:      {AdminEmail}");
        TestContext.WriteLine($"Frontend:   {(IsFrontendAvailable ? "OK" : "UNAVAILABLE")}");
        TestContext.WriteLine($"Backend:    {(IsBackendAvailable ? "OK" : "UNAVAILABLE")}");
    }

    [OneTimeTearDown]
    public void RunAfterAllTests()
    {
        TestContext.WriteLine("=== Selenium Test Suite – Global Teardown ===");
    }

    private async Task WarmUpServices()
    {
        TestContext.WriteLine("Warming up services...");

        using var api = new ApiHelper(_settings);

        for (int attempt = 1; attempt <= 5; attempt++)
        {
            try
            {
                IsFrontendAvailable = await api.CheckFrontendHealthAsync();
                if (IsFrontendAvailable)
                {
                    TestContext.WriteLine($"  Frontend is healthy (attempt {attempt})");
                    break;
                }
            }
            catch (Exception ex)
            {
                TestContext.WriteLine($"  Frontend check attempt {attempt} failed: {ex.Message}");
            }

            if (attempt < 5)
                await Task.Delay(TimeSpan.FromSeconds(5));
        }

        if (!IsFrontendAvailable)
            TestContext.WriteLine("  WARNING: Frontend may be unavailable");

        for (int attempt = 1; attempt <= 5; attempt++)
        {
            try
            {
                IsBackendAvailable = await api.CheckBackendHealthAsync();
                if (IsBackendAvailable)
                {
                    TestContext.WriteLine($"  Backend is healthy (attempt {attempt})");
                    break;
                }
            }
            catch (Exception ex)
            {
                TestContext.WriteLine($"  Backend check attempt {attempt} failed: {ex.Message}");
            }

            if (attempt < 5)
                await Task.Delay(TimeSpan.FromSeconds(5));
        }

        if (!IsBackendAvailable)
            TestContext.WriteLine("  WARNING: Backend may be unavailable");
    }

    private async Task EnsureTestAccounts()
    {
        TestContext.WriteLine("Ensuring test accounts exist...");

        using var api = new ApiHelper(_settings);

        // Test user
        TestUserEmail = !string.IsNullOrEmpty(_settings.UserEmail)
            ? _settings.UserEmail
            : TestDataHelper.GenerateEmail("seleniumuser");
        TestUserPassword = _settings.UserPassword;

        try
        {
            var loginResult = await api.LoginAsync(TestUserEmail, TestUserPassword);
            if (loginResult?.IsSuccess == true)
            {
                TestContext.WriteLine($"  Test user login OK: {TestUserEmail}");
            }
            else
            {
                TestContext.WriteLine($"  Test user login failed, attempting registration...");
                var registerResult = await api.RegisterAsync(
                    _settings.UserFirstName,
                    _settings.UserLastName,
                    TestUserEmail,
                    TestUserPassword);

                if (registerResult?.IsSuccess == true)
                {
                    TestContext.WriteLine($"  Test user registered: {TestUserEmail}");
                }
                else
                {
                    TestContext.WriteLine(
                        $"  WARNING: Could not create test user: " +
                        $"{registerResult?.StatusCode} - {registerResult?.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            TestContext.WriteLine($"  WARNING: Test user setup failed: {ex.Message}");
        }

        // Admin
        AdminEmail = _settings.AdminEmail;
        AdminPassword = _settings.AdminPassword;

        if (!string.IsNullOrEmpty(AdminEmail) && !string.IsNullOrEmpty(AdminPassword))
        {
            try
            {
                var adminLogin = await api.LoginAsync(AdminEmail, AdminPassword);
                if (adminLogin?.IsSuccess == true)
                {
                    TestContext.WriteLine($"  Admin login OK: {AdminEmail}");
                }
                else
                {
                    TestContext.WriteLine(
                        $"  WARNING: Admin login failed: {adminLogin?.StatusCode} - {adminLogin?.Message}");
                }
            }
            catch (Exception ex)
            {
                TestContext.WriteLine($"  WARNING: Admin setup failed: {ex.Message}");
            }
        }
        else
        {
            TestContext.WriteLine("  Admin credentials not configured, skipping admin setup");
        }
    }
}
