using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Dashboard;

public class MyContentPage : BasePage
{
    private const string PagePath = "/dashboard/my-content";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'My Content')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'enrolled in or purchased')]");
    private By ContentCards => By.CssSelector("a[href*='/resources/'][class*='rounded-xl']");
    private By ContentTitles => By.CssSelector("a[href*='/resources/'] p[class*='font-semibold']");
    private By ContentTypeBadges => By.CssSelector("a[href*='/resources/'] [class*='badge']");
    private By NoContentMessage => By.XPath("//p[contains(text(),'No content yet')]");
    private By NoContentDescription => By.XPath("//p[contains(text(),'Enroll in free')]");
    private By BrowseResourcesLink => By.XPath("//a[contains(text(),'Browse Resources')]");
    private By EnrollmentDates => By.XPath("//p[contains(text(),'Enrolled')]");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public MyContentPage(IWebDriver driver) : base(driver) { }

    public MyContentPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        WaitForSpinnerToDisappear();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public string GetSubtitleText()
    {
        try { return GetText(PageSubtitle); }
        catch { return string.Empty; }
    }

    // Content
    public int GetContentCardCount()
    {
        try { return Driver.FindElements(ContentCards).Count; }
        catch { return 0; }
    }

    public bool HasContent() => GetContentCardCount() > 0;

    public IReadOnlyList<string> GetContentTitles()
    {
        try
        {
            return Driver.FindElements(ContentTitles).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool IsNoContentMessageDisplayed() => IsElementDisplayed(NoContentMessage);

    public bool IsBrowseResourcesLinkDisplayed() => IsElementDisplayed(BrowseResourcesLink);

    // Interactions
    public void ClickContentCard(int index)
    {
        var cards = Driver.FindElements(ContentCards);
        if (index < cards.Count)
        {
            Wait.ScrollToElement(cards[index]);
            cards[index].Click();
        }
    }

    public void ClickBrowseResources() => Click(BrowseResourcesLink);
}
