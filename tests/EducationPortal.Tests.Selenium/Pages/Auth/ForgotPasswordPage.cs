using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Auth;

public class ForgotPasswordPage : BasePage
{
    private const string PagePath = "/auth/forgot-password";

    // Locators
    private By PageHeading => By.XPath("//h1[contains(text(),'Forgot password')]");
    private By SubHeading => By.XPath("//p[contains(text(),'reset link')]");
    private By EmailField => By.CssSelector("input[type='email'][placeholder*='example']");
    private By SendResetButton => By.XPath("//button[contains(text(),'Send reset link')]");
    private By BackToLoginLink => By.XPath("//a[contains(text(),'Back to login')]");
    private By SuccessMessage => By.XPath("//p[contains(text(),'Check your email')]");
    private By SuccessDescription => By.XPath("//p[contains(text(),'reset link has been sent')]");
    private By EmailLabel => By.XPath("//label[contains(text(),'Email')]");

    public ForgotPasswordPage(IWebDriver driver) : base(driver) { }

    public ForgotPasswordPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() =>
        IsElementDisplayed(PageHeading) && IsElementDisplayed(EmailField);

    public string GetHeadingText() => GetText(PageHeading);

    public string GetSubHeadingText() => GetText(SubHeading);

    public bool IsEmailFieldDisplayed() => IsElementDisplayed(EmailField);

    public bool IsSendResetButtonDisplayed() => IsElementDisplayed(SendResetButton);

    public bool IsBackToLoginLinkDisplayed() => IsElementDisplayed(BackToLoginLink);

    public bool IsSuccessMessageDisplayed() => IsElementDisplayed(SuccessMessage);

    // Interactions
    public void EnterEmail(string email) => TypeText(EmailField, email);

    public void ClickSendReset() => Click(SendResetButton);

    public void ClickBackToLogin() => Click(BackToLoginLink);

    public void SubmitResetRequest(string email)
    {
        EnterEmail(email);
        ClickSendReset();
    }

    public void SubmitAndVerifySuccess(string email)
    {
        SubmitResetRequest(email);
        Wait.WaitForElement(SuccessMessage, TimeSpan.FromSeconds(5));
    }

    // Post-submission
    public string GetSuccessText() => GetText(SuccessMessage);

    public string GetSuccessDescription() => GetText(SuccessDescription);

    public bool IsSubmittedSuccessfully() =>
        IsSuccessMessageDisplayed() && IsElementDisplayed(SuccessDescription);
}
