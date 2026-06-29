using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminAnalyticsPage : BasePage
{
    private const string PagePath = "/admin/analytics";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Analytics')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Revenue and enrollment')]");

    // Period selector
    private By PeriodButtons => By.CssSelector("div[class*='rounded-lg'][class*='border'] button");
    private By SevenDaysButton => By.XPath("//button[contains(text(),'7 days')]");
    private By ThirtyDaysButton => By.XPath("//button[contains(text(),'30 days')]");
    private By NinetyDaysButton => By.XPath("//button[contains(text(),'90 days')]");
    private By SelectedPeriod => By.CssSelector("button[class*='bg-primary-600']");

    // Summary cards
    private By SummaryCards => By.CssSelector("div[class*='grid-cols-3'] div[class*='rounded-xl']");
    private By TotalRevenueCard => By.XPath("//p[contains(text(),'Total Revenue')]");
    private By TotalEnrollmentsCard => By.XPath("//p[contains(text(),'Total Enrollments')]");
    private By AvgOrderValueCard => By.XPath("//p[contains(text(),'Revenue / Enrollment')]");
    private By SummaryValues => By.CssSelector("div[class*='grid-cols-3'] p[class*='text-2xl']");

    // Charts
    private By RevenueChartHeading => By.XPath("//h2[contains(text(),'Revenue')]");
    private By EnrollmentsChartHeading => By.XPath("//h2[contains(text(),'Enrollments')]");
    private By ChartContainers => By.CssSelector("div[class*='rounded-xl'][class*='shadow-card'] div[class*='recharts'], canvas");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public AdminAnalyticsPage(IWebDriver driver) : base(driver) { }

    public AdminAnalyticsPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    // Period
    public int GetPeriodButtonCount()
    {
        try { return Driver.FindElements(PeriodButtons).Count; }
        catch { return 0; }
    }

    public void Select7Days() => Click(SevenDaysButton);

    public void Select30Days() => Click(ThirtyDaysButton);

    public void Select90Days() => Click(NinetyDaysButton);

    public string GetSelectedPeriod()
    {
        try { return GetText(SelectedPeriod); }
        catch { return string.Empty; }
    }

    // Summary cards
    public int GetSummaryCardCount()
    {
        try { return Driver.FindElements(SummaryCards).Count; }
        catch { return 0; }
    }

    public bool IsTotalRevenueCardDisplayed() => IsElementDisplayed(TotalRevenueCard);

    public bool IsTotalEnrollmentsCardDisplayed() => IsElementDisplayed(TotalEnrollmentsCard);

    public bool IsAvgOrderValueCardDisplayed() => IsElementDisplayed(AvgOrderValueCard);

    public bool AreAllSummaryCardsDisplayed() =>
        IsTotalRevenueCardDisplayed() &&
        IsTotalEnrollmentsCardDisplayed() &&
        IsAvgOrderValueCardDisplayed();

    // Charts
    public bool IsRevenueChartDisplayed() => IsElementDisplayed(RevenueChartHeading);

    public bool IsEnrollmentsChartDisplayed() => IsElementDisplayed(EnrollmentsChartHeading);

    public bool AreBothChartsDisplayed() =>
        IsRevenueChartDisplayed() && IsEnrollmentsChartDisplayed();
}
