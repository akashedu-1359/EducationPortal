using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Checkout;

public class CheckoutPage : BasePage
{
    // Locators
    private By PageHeading => By.XPath("//h1[contains(text(),'Complete your purchase')]");
    private By PaymentSubtitle => By.XPath("//p[contains(text(),'Secure payment')]");
    private By CreditCardIcon => By.CssSelector("svg.lucide-credit-card");
    private By PaymentMethodLabel => By.XPath("//p[contains(text(),'Payment method')]");
    private By StripeButton => By.XPath("//button[contains(text(),'Stripe')]");
    private By RazorpayButton => By.XPath("//button[contains(text(),'Razorpay')]");
    private By SelectedPaymentMethod => By.CssSelector("button[class*='border-primary']");
    private By SecurityBadge => By.CssSelector("div[class*='bg-green-50']");
    private By SecurityText => By.XPath("//p[contains(text(),'encrypted and secure')]");
    private By SecurityIcon => By.CssSelector("svg.lucide-shield");
    private By PayNowButton => By.XPath("//button[contains(text(),'Pay Now')]");
    private By BackLink => By.XPath("//a[contains(text(),'Back')]");
    private By TermsLink => By.XPath("//a[contains(text(),'Terms')]");
    private By PurchaseCard => By.CssSelector("div[class*='rounded-2xl'][class*='bg-white']");

    public CheckoutPage(IWebDriver driver) : base(driver) { }

    public new CheckoutPage NavigateTo(string resourceId)
    {
        NavigateToUrl($"/checkout/{resourceId}");
        WaitForPageLoad();
        WaitForSpinnerToDisappear();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageHeading);

    public string GetHeadingText() => GetText(PageHeading);

    public string GetPaymentSubtitle()
    {
        try { return GetText(PaymentSubtitle); }
        catch { return string.Empty; }
    }

    public bool IsCreditCardIconDisplayed() => IsElementDisplayed(CreditCardIcon);

    public bool IsPaymentMethodLabelDisplayed() => IsElementDisplayed(PaymentMethodLabel);

    public bool IsStripeButtonDisplayed() => IsElementDisplayed(StripeButton);

    public bool IsRazorpayButtonDisplayed() => IsElementDisplayed(RazorpayButton);

    public bool HasPaymentMethodSelector() =>
        IsStripeButtonDisplayed() || IsRazorpayButtonDisplayed();

    public string GetSelectedPaymentMethod()
    {
        try { return GetText(SelectedPaymentMethod); }
        catch { return string.Empty; }
    }

    // Security
    public bool IsSecurityBadgeDisplayed() => IsElementDisplayed(SecurityBadge);

    public string GetSecurityText()
    {
        try { return GetText(SecurityText); }
        catch { return string.Empty; }
    }

    public bool IsSecurityIconDisplayed() => IsElementDisplayed(SecurityIcon);

    // Buttons
    public bool IsPayNowButtonDisplayed() => IsElementDisplayed(PayNowButton);

    public bool IsBackLinkDisplayed() => IsElementDisplayed(BackLink);

    public bool IsTermsLinkDisplayed() => IsElementDisplayed(TermsLink);

    // Interactions
    public void SelectStripe() => Click(StripeButton);

    public void SelectRazorpay() => Click(RazorpayButton);

    public void ClickPayNow() => Click(PayNowButton);

    public void ClickBack() => Click(BackLink);

    // Full page validation
    public bool IsFullPageLoaded() =>
        IsPageLoaded() &&
        HasPaymentMethodSelector() &&
        IsSecurityBadgeDisplayed() &&
        IsPayNowButtonDisplayed();
}
