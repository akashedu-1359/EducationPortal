using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Checkout;

public class CheckoutSuccessPage : BasePage
{
    private const string PagePath = "/checkout/success";

    // Locators
    private By SuccessIcon => By.CssSelector("svg.lucide-check-circle, div[class*='bg-green-100'] svg");
    private By SuccessHeading => By.XPath("//h1[contains(text(),'Payment Successful')]");
    private By SuccessDescription => By.XPath("//p[contains(text(),'full access')]");
    private By GoToMyContentLink => By.XPath("//a[contains(text(),'Go to My Content')]");
    private By BrowseMoreLink => By.XPath("//a[contains(text(),'Browse More Resources')]");
    private By SuccessCard => By.CssSelector("div[class*='rounded-2xl'][class*='bg-white']");

    public CheckoutSuccessPage(IWebDriver driver) : base(driver) { }

    public CheckoutSuccessPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    public CheckoutSuccessPage NavigateToWithOrder(string orderId, string provider)
    {
        NavigateToUrl($"{PagePath}?orderId={orderId}&provider={provider}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(SuccessHeading);

    public bool IsSuccessIconDisplayed() => IsElementDisplayed(SuccessIcon);

    public string GetHeadingText() => GetText(SuccessHeading);

    public string GetDescriptionText()
    {
        try { return GetText(SuccessDescription); }
        catch { return string.Empty; }
    }

    public bool IsGoToMyContentDisplayed() => IsElementDisplayed(GoToMyContentLink);

    public bool IsBrowseMoreDisplayed() => IsElementDisplayed(BrowseMoreLink);

    public bool IsSuccessCardDisplayed() => IsElementDisplayed(SuccessCard);

    // Interactions
    public void ClickGoToMyContent() => Click(GoToMyContentLink);

    public void ClickBrowseMore() => Click(BrowseMoreLink);

    // Full page validation
    public bool IsFullPageLoaded() =>
        IsSuccessIconDisplayed() &&
        IsPageLoaded() &&
        IsGoToMyContentDisplayed() &&
        IsBrowseMoreDisplayed();
}
