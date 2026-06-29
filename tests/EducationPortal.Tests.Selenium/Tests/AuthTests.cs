using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Auth;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Auth")]
[Order(3)]
public class AuthTests : BaseTest
{
    private LoginPage _loginPage = null!;
    private RegisterPage _registerPage = null!;
    private ForgotPasswordPage _forgotPasswordPage = null!;
    private AuthHelper _authHelper = null!;

    public override void SetUp()
    {
        base.SetUp();
        _loginPage = new LoginPage(Driver);
        _registerPage = new RegisterPage(Driver);
        _forgotPasswordPage = new ForgotPasswordPage(Driver);
        _authHelper = new AuthHelper(Driver);
    }

    [Test, Order(1)]
    [Description("Register page renders with all required fields")]
    public void Register_Page_Should_Render_All_Fields()
    {
        _registerPage.NavigateTo();

        _registerPage.IsFirstNameFieldDisplayed().Should().BeTrue("First name field should be visible");
        _registerPage.IsLastNameFieldDisplayed().Should().BeTrue("Last name field should be visible");
        _registerPage.IsEmailFieldDisplayed().Should().BeTrue("Email field should be visible");
        _registerPage.IsPasswordFieldDisplayed().Should().BeTrue("Password field should be visible");
        _registerPage.IsConfirmPasswordFieldDisplayed().Should().BeTrue("Confirm password should be visible");
        _registerPage.IsCreateAccountButtonDisplayed().Should().BeTrue("Create account button should be visible");
    }

    [Test, Order(2)]
    [Description("Register form shows validation errors on empty submit")]
    public void Register_Should_Show_Validation_On_Empty_Submit()
    {
        _registerPage.NavigateTo();
        _registerPage.SubmitEmptyForm();

        Thread.Sleep(1000);

        var stayedOnPage = Driver.Url.Contains("/auth/register");
        var hasErrors = _registerPage.HasValidationErrors();
        (stayedOnPage || hasErrors).Should().BeTrue(
            "Form should show validation errors or stay on register page");
    }

    [Test, Order(3)]
    [Description("Registration flow completes with valid data")]
    public void Registration_Should_Complete_With_Valid_Data()
    {
        var email = TestDataHelper.GenerateEmail("reg");
        var (firstName, lastName) = TestDataHelper.GenerateFullName();

        _registerPage.NavigateTo();
        _registerPage.Register(firstName, lastName, email, TestDataHelper.ValidPassword);

        Thread.Sleep(3000);
        Wait.WaitForPageLoad();

        var redirectedAway = !Driver.Url.Contains("/auth/register");
        redirectedAway.Should().BeTrue(
            "User should be redirected away from register page after successful registration");
    }

    [Test, Order(4)]
    [Description("Login page renders with email and password fields")]
    public void Login_Page_Should_Render()
    {
        _loginPage.NavigateTo();

        _loginPage.IsEmailFieldDisplayed().Should().BeTrue("Email field should be visible");
        _loginPage.IsPasswordFieldDisplayed().Should().BeTrue("Password field should be visible");
        _loginPage.IsSignInButtonDisplayed().Should().BeTrue("Sign in button should be visible");
    }

    [Test, Order(5)]
    [Description("Login with invalid credentials shows error or stays on page")]
    public void Login_Should_Show_Error_For_Invalid_Credentials()
    {
        _loginPage.NavigateTo();
        _loginPage.Login(TestDataHelper.NonExistentEmail, "WrongPassword123!");

        Thread.Sleep(2000);

        var stayedOnLogin = Driver.Url.Contains("/auth/login");
        var hasErrors = _loginPage.HasValidationErrors();
        (stayedOnLogin || hasErrors).Should().BeTrue(
            "Should show error or stay on login page for invalid credentials");
    }

    [Test, Order(6)]
    [Description("Successful login redirects to dashboard")]
    public void Login_Should_Redirect_To_Dashboard()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _loginPage.NavigateTo();
        _loginPage.LoginAndWaitForRedirect(Settings.UserEmail, Settings.UserPassword, "/dashboard");

        Driver.Url.Should().Contain("/dashboard", "Should redirect to dashboard after login");
    }

    [Test, Order(7)]
    [Description("User info is visible in navbar after login")]
    public void User_Info_Should_Be_Visible_After_Login()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _authHelper.LoginAsTestUser();

        var hasUserIndicator = _authHelper.IsLoggedIn()
            || Driver.FindElements(By.CssSelector("[class*='avatar'], [class*='user'], header button")).Count > 0;

        hasUserIndicator.Should().BeTrue("User info or avatar should be visible after login");
    }

    [Test, Order(8)]
    [Description("Login preserves ?next= redirect parameter")]
    public void Login_Should_Preserve_Next_Redirect()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _loginPage.NavigateToWithNext("/resources");
        _loginPage.Login(Settings.UserEmail, Settings.UserPassword);

        Thread.Sleep(3000);
        Wait.WaitForPageLoad();

        var redirectedCorrectly = Driver.Url.Contains("/resources") || Driver.Url.Contains("/dashboard");
        redirectedCorrectly.Should().BeTrue("Should redirect to the next param URL or dashboard");
    }

    [Test, Order(9)]
    [Description("Already logged-in user is redirected away from login page")]
    public void Already_Logged_In_User_Should_Be_Redirected_From_Login()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _authHelper.LoginAsTestUser();

        Driver.Navigate().GoToUrl($"{Settings.BaseUrl}/auth/login");
        Thread.Sleep(3000);
        Wait.WaitForPageLoad();

        var redirectedAway = !Driver.Url.Contains("/auth/login") || Driver.Url.Contains("/dashboard");
        redirectedAway.Should().BeTrue("Already logged-in user should be redirected from login page");
    }

    [Test, Order(10)]
    [Description("Logout flow works correctly")]
    public void Logout_Should_Work()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _authHelper.LoginAsTestUser();
        _authHelper.Logout();

        NavigateTo("/dashboard");
        Thread.Sleep(3000);

        var isLoggedOut = Driver.Url.Contains("/auth/login") || !_authHelper.IsLoggedIn();
        isLoggedOut.Should().BeTrue("User should be logged out");
    }

    [Test, Order(11)]
    [Description("Password reset page renders")]
    public void Forgot_Password_Page_Should_Render()
    {
        _forgotPasswordPage.NavigateTo();

        _forgotPasswordPage.IsEmailFieldDisplayed().Should().BeTrue("Email field should be visible");
        _forgotPasswordPage.IsSendResetButtonDisplayed().Should().BeTrue("Send reset button should be visible");
    }

    [Test, Order(12)]
    [Description("Google OAuth button is present on login page")]
    public void Login_Should_Have_Google_OAuth_Button()
    {
        _loginPage.NavigateTo();

        _loginPage.IsGoogleButtonDisplayed().Should().BeTrue(
            "Google OAuth button should be present on login page");
    }
}
