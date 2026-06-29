using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Config;
using EducationPortal.Tests.Selenium.Pages.Auth;

namespace EducationPortal.Tests.Selenium.Helpers;

public class AuthHelper
{
    private readonly IWebDriver _driver;
    private readonly TestSettings _settings;
    private readonly WaitHelpers _wait;

    public AuthHelper(IWebDriver driver, TestSettings? settings = null)
    {
        _driver = driver;
        _settings = settings ?? TestSettings.Instance;
        _wait = new WaitHelpers(driver, _settings);
    }

    /// <summary>
    /// Login via the UI using the login page.
    /// </summary>
    public void LoginViaUi(string email, string password)
    {
        var loginPage = new LoginPage(_driver);
        loginPage.NavigateTo();
        loginPage.Login(email, password);
        _wait.WaitForUrlContains("/dashboard");
        _wait.WaitForPageLoad();
    }

    /// <summary>
    /// Login with the default test user credentials.
    /// </summary>
    public void LoginAsTestUser()
    {
        if (string.IsNullOrEmpty(_settings.UserEmail))
            throw new InvalidOperationException("Test user email not configured");

        LoginViaUi(_settings.UserEmail, _settings.UserPassword);
    }

    /// <summary>
    /// Login with admin credentials.
    /// </summary>
    public void LoginAsAdmin()
    {
        if (string.IsNullOrEmpty(_settings.AdminEmail))
            throw new InvalidOperationException("Admin email not configured");

        var loginPage = new LoginPage(_driver);
        loginPage.NavigateTo();
        loginPage.Login(_settings.AdminEmail, _settings.AdminPassword);
        _wait.WaitForUrlContains("/admin");
        _wait.WaitForPageLoad();
    }

    /// <summary>
    /// Login via API (injects auth cookies/tokens using JavaScript).
    /// Faster than UI login for tests that only need auth state.
    /// </summary>
    public async Task LoginViaApiAsync(string email, string password)
    {
        using var api = new ApiHelper(_settings);
        var result = await api.LoginAsync(email, password);

        if (result is null || !result.IsSuccess)
            throw new Exception($"API login failed for {email}: {result?.Message ?? "No response"}");

        var token = api.GetAccessToken();
        if (string.IsNullOrEmpty(token))
            throw new Exception("No access token received from API login");

        _driver.Navigate().GoToUrl(_settings.BaseUrl);
        _wait.WaitForPageLoad();

        ((IJavaScriptExecutor)_driver).ExecuteScript($@"
            try {{
                const store = JSON.parse(localStorage.getItem('auth-storage') || '{{}}');
                store.state = store.state || {{}};
                store.state.accessToken = '{EscapeJs(token)}';
                store.state.isAuthenticated = true;
                localStorage.setItem('auth-storage', JSON.stringify(store));
            }} catch(e) {{
                localStorage.setItem('auth-token', '{EscapeJs(token)}');
            }}
        ");

        _driver.Navigate().Refresh();
        _wait.WaitForPageLoad();
    }

    /// <summary>
    /// Login the default test user via API.
    /// </summary>
    public async Task LoginTestUserViaApiAsync()
    {
        if (string.IsNullOrEmpty(_settings.UserEmail))
            throw new InvalidOperationException("Test user email not configured");

        await LoginViaApiAsync(_settings.UserEmail, _settings.UserPassword);
    }

    /// <summary>
    /// Register a new user via the UI.
    /// </summary>
    public void RegisterViaUi(string firstName, string lastName, string email, string password)
    {
        var registerPage = new RegisterPage(_driver);
        registerPage.NavigateTo();
        registerPage.Register(firstName, lastName, email, password);
        _wait.WaitForUrlContains("/dashboard");
        _wait.WaitForPageLoad();
    }

    /// <summary>
    /// Register a new user via the API.
    /// </summary>
    public async Task<bool> RegisterViaApiAsync(string firstName, string lastName,
        string email, string password)
    {
        using var api = new ApiHelper(_settings);
        try
        {
            var result = await api.RegisterAsync(firstName, lastName, email, password);
            return result?.IsSuccess == true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Ensure a user exists (register if not, ignore if already exists).
    /// </summary>
    public async Task EnsureUserExistsAsync(string firstName, string lastName,
        string email, string password)
    {
        using var api = new ApiHelper(_settings);

        var loginResult = await api.LoginAsync(email, password);
        if (loginResult?.IsSuccess == true) return;

        var registerResult = await api.RegisterAsync(firstName, lastName, email, password);
        if (registerResult?.IsSuccess != true)
        {
            NUnit.Framework.TestContext.WriteLine(
                $"Warning: Could not ensure user {email} exists. " +
                $"Register returned: {registerResult?.StatusCode} - {registerResult?.Message}");
        }
    }

    /// <summary>
    /// Logout by clearing browser storage and cookies.
    /// </summary>
    public void Logout()
    {
        try
        {
            ((IJavaScriptExecutor)_driver).ExecuteScript(@"
                localStorage.clear();
                sessionStorage.clear();
            ");

            _driver.Manage().Cookies.DeleteAllCookies();
            _driver.Navigate().Refresh();
            _wait.WaitForPageLoad();
        }
        catch (Exception ex)
        {
            NUnit.Framework.TestContext.WriteLine($"Logout cleanup warning: {ex.Message}");
        }
    }

    /// <summary>
    /// Check if the user is currently logged in (user menu visible in navbar).
    /// </summary>
    public bool IsLoggedIn()
    {
        try
        {
            var userMenu = By.CssSelector("header button[class*='rounded-full']");
            return _driver.FindElement(userMenu).Displayed;
        }
        catch
        {
            return false;
        }
    }

    // Static convenience methods for use in tests
    public static void LoginAsUser(IWebDriver driver, TestSettings settings)
    {
        var helper = new AuthHelper(driver, settings);
        helper.LoginAsTestUser();
    }

    public static void LoginAsAdmin(IWebDriver driver, TestSettings settings)
    {
        var helper = new AuthHelper(driver, settings);
        helper.LoginAsAdmin();
    }

    private static string EscapeJs(string value) =>
        value.Replace("\\", "\\\\")
             .Replace("'", "\\'")
             .Replace("\"", "\\\"")
             .Replace("\n", "\\n")
             .Replace("\r", "\\r");
}
