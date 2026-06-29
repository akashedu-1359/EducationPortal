using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Auth;

public class LoginPage : BasePage
{
    private const string PagePath = "/auth/login";

    // Locators
    private By PageHeading => By.XPath("//h1[contains(text(),'Welcome back')]");
    private By SubHeading => By.XPath("//p[contains(text(),'Sign in to continue')]");
    private By EmailField => By.CssSelector("input[type='email'][placeholder*='example']");
    private By PasswordField => By.CssSelector("input[type='password'], input[placeholder*='password' i]");
    private By SignInButton => By.XPath("//button[contains(text(),'Sign In')]");
    private By GoogleButton => By.XPath("//button[contains(text(),'Continue with Google')]");
    private By ForgotPasswordLink => By.XPath("//a[contains(text(),'Forgot password')]");
    private By CreateAccountLink => By.XPath("//a[contains(text(),'Create one free')]");
    private By OrDivider => By.XPath("//span[contains(text(),'OR')]");
    private By EmailError => By.XPath("//input[@type='email']/ancestor::div[contains(@class,'relative')]/following-sibling::p");
    private By PasswordError => By.XPath("//input[contains(@placeholder,'password')]/ancestor::div[contains(@class,'relative')]/following-sibling::p");
    private By ShowPasswordToggle => By.CssSelector("button[aria-label*='password' i]");
    private By EmailLabel => By.XPath("//label[contains(text(),'Email')]");
    private By PasswordLabel => By.XPath("//label[contains(text(),'Password')]");

    public LoginPage(IWebDriver driver) : base(driver) { }

    public LoginPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    public LoginPage NavigateToWithNext(string nextUrl)
    {
        NavigateToUrl($"{PagePath}?next={Uri.EscapeDataString(nextUrl)}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() =>
        IsElementDisplayed(PageHeading) && IsElementDisplayed(EmailField);

    public string GetHeadingText() => GetText(PageHeading);

    public string GetSubHeadingText() => GetText(SubHeading);

    public bool IsEmailFieldDisplayed() => IsElementDisplayed(EmailField);

    public bool IsPasswordFieldDisplayed() => IsElementDisplayed(PasswordField);

    public bool IsSignInButtonDisplayed() => IsElementDisplayed(SignInButton);

    public bool IsGoogleButtonDisplayed() => IsElementDisplayed(GoogleButton);

    public bool IsForgotPasswordLinkDisplayed() => IsElementDisplayed(ForgotPasswordLink);

    public bool IsCreateAccountLinkDisplayed() => IsElementDisplayed(CreateAccountLink);

    public bool IsOrDividerDisplayed() => IsElementDisplayed(OrDivider);

    public bool IsEmailLabelDisplayed() => IsElementDisplayed(EmailLabel);

    public bool IsPasswordLabelDisplayed() => IsElementDisplayed(PasswordLabel);

    // Interactions
    public void EnterEmail(string email) => TypeText(EmailField, email);

    public void EnterPassword(string password) => TypeText(PasswordField, password);

    public void ClickSignIn() => Click(SignInButton);

    public void ClickGoogleLogin() => Click(GoogleButton);

    public void ClickForgotPassword() => Click(ForgotPasswordLink);

    public void ClickCreateAccount() => Click(CreateAccountLink);

    public void TogglePasswordVisibility() => Click(ShowPasswordToggle);

    public void Login(string email, string password)
    {
        EnterEmail(email);
        EnterPassword(password);
        ClickSignIn();
    }

    public void LoginAndWaitForRedirect(string email, string password, string expectedUrlPart)
    {
        Login(email, password);
        Wait.WaitForUrlContains(expectedUrlPart);
    }

    // Validation messages
    public string GetEmailError()
    {
        try { return GetText(EmailError); }
        catch { return string.Empty; }
    }

    public string GetPasswordError()
    {
        try { return GetText(PasswordError); }
        catch { return string.Empty; }
    }

    public bool HasValidationErrors()
    {
        return !string.IsNullOrEmpty(GetEmailError()) ||
               !string.IsNullOrEmpty(GetPasswordError());
    }

    // Password visibility
    public string GetPasswordFieldType()
    {
        var element = FindElement(PasswordField);
        return element.GetAttribute("type") ?? "password";
    }

    public bool IsPasswordVisible() => GetPasswordFieldType() == "text";
}
