using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Auth;

public class RegisterPage : BasePage
{
    private const string PagePath = "/auth/register";

    // Locators
    private By PageHeading => By.XPath("//h1[contains(text(),'Create your account')]");
    private By SubHeading => By.XPath("//p[contains(text(),'Start learning for free')]");
    private By FirstNameField => By.CssSelector("input[placeholder='John'], input[autocomplete='given-name']");
    private By LastNameField => By.CssSelector("input[placeholder='Doe'], input[autocomplete='family-name']");
    private By EmailField => By.CssSelector("input[type='email'][placeholder*='example']");
    private By PasswordField => By.CssSelector("input[placeholder*='8 characters' i], input[autocomplete='new-password']:first-of-type");
    private By ConfirmPasswordField => By.CssSelector("input[placeholder*='Repeat' i]");
    private By CreateAccountButton => By.XPath("//button[contains(text(),'Create Account')]");
    private By SignInLink => By.XPath("//a[contains(text(),'Sign in')]");
    private By TermsLink => By.XPath("//a[contains(text(),'Terms')]");
    private By PrivacyLink => By.XPath("//a[contains(text(),'Privacy')]");
    private By PasswordHint => By.XPath("//p[contains(text(),'uppercase')]");
    private By FirstNameLabel => By.XPath("//label[contains(text(),'First name')]");
    private By LastNameLabel => By.XPath("//label[contains(text(),'Last name')]");
    private By EmailLabel => By.XPath("//label[contains(text(),'Email')]");
    private By PasswordLabel => By.XPath("//label[contains(text(),'Password') and not(contains(text(),'Confirm'))]");
    private By ConfirmPasswordLabel => By.XPath("//label[contains(text(),'Confirm')]");
    private By FormErrorMessages => By.CssSelector("p[class*='text-red'], p[class*='text-destructive']");
    private By ShowPasswordToggles => By.CssSelector("button[aria-label*='password' i]");

    public RegisterPage(IWebDriver driver) : base(driver) { }

    public RegisterPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() =>
        IsElementDisplayed(PageHeading) && IsElementDisplayed(FirstNameField);

    public string GetHeadingText() => GetText(PageHeading);

    public string GetSubHeadingText() => GetText(SubHeading);

    public bool IsFirstNameFieldDisplayed() => IsElementDisplayed(FirstNameField);

    public bool IsLastNameFieldDisplayed() => IsElementDisplayed(LastNameField);

    public bool IsEmailFieldDisplayed() => IsElementDisplayed(EmailField);

    public bool IsPasswordFieldDisplayed() => IsElementDisplayed(PasswordField);

    public bool IsConfirmPasswordFieldDisplayed() => IsElementDisplayed(ConfirmPasswordField);

    public bool IsCreateAccountButtonDisplayed() => IsElementDisplayed(CreateAccountButton);

    public bool IsSignInLinkDisplayed() => IsElementDisplayed(SignInLink);

    public bool IsTermsLinkDisplayed() => IsElementDisplayed(TermsLink);

    public bool IsPrivacyLinkDisplayed() => IsElementDisplayed(PrivacyLink);

    public bool IsPasswordHintDisplayed() => IsElementDisplayed(PasswordHint);

    public bool AreAllFieldsDisplayed() =>
        IsFirstNameFieldDisplayed() &&
        IsLastNameFieldDisplayed() &&
        IsEmailFieldDisplayed() &&
        IsPasswordFieldDisplayed() &&
        IsConfirmPasswordFieldDisplayed();

    public bool AreAllLabelsDisplayed() =>
        IsElementDisplayed(FirstNameLabel) &&
        IsElementDisplayed(LastNameLabel) &&
        IsElementDisplayed(EmailLabel) &&
        IsElementDisplayed(PasswordLabel) &&
        IsElementDisplayed(ConfirmPasswordLabel);

    // Interactions
    public void EnterFirstName(string name) => TypeText(FirstNameField, name);

    public void EnterLastName(string name) => TypeText(LastNameField, name);

    public void EnterEmail(string email) => TypeText(EmailField, email);

    public void EnterPassword(string password) => TypeText(PasswordField, password);

    public void EnterConfirmPassword(string password) => TypeText(ConfirmPasswordField, password);

    public void ClickCreateAccount() => Click(CreateAccountButton);

    public void ClickSignInLink() => Click(SignInLink);

    public void Register(string firstName, string lastName, string email, string password)
    {
        EnterFirstName(firstName);
        EnterLastName(lastName);
        EnterEmail(email);
        EnterPassword(password);
        EnterConfirmPassword(password);
        ClickCreateAccount();
    }

    public void RegisterAndWaitForRedirect(string firstName, string lastName,
        string email, string password, string expectedUrlPart)
    {
        Register(firstName, lastName, email, password);
        Wait.WaitForUrlContains(expectedUrlPart);
    }

    public void SubmitEmptyForm() => ClickCreateAccount();

    // Validation
    public IReadOnlyList<string> GetValidationErrors()
    {
        try
        {
            var elements = Driver.FindElements(FormErrorMessages);
            return elements.Select(e => e.Text).Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public bool HasValidationErrors() => GetValidationErrors().Count > 0;

    public int GetValidationErrorCount() => GetValidationErrors().Count;
}
