using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Dashboard;

public class DashboardPage : BasePage
{
    private const string PagePath = "/dashboard";

    // Locators
    private By WelcomeHeading => By.XPath("//h1[contains(text(),'Welcome back')]");
    private By SummaryText => By.XPath("//p[contains(text(),'learning journey')]");

    // Stats cards
    private By StatsCards => By.CssSelector(".grid .rounded-xl, .grid [class*='card']");
    private By EnrolledStat => By.XPath("//p[contains(text(),'Enrolled')]/preceding-sibling::p");
    private By EnrolledLabel => By.XPath("//p[contains(text(),'Enrolled')]");
    private By ExamsTakenStat => By.XPath("//p[contains(text(),'Exams taken')]/preceding-sibling::p");
    private By ExamsTakenLabel => By.XPath("//p[contains(text(),'Exams taken')]");
    private By CertificatesStat => By.XPath("//p[contains(text(),'Certificates')]/preceding-sibling::p");
    private By CertificatesLabel => By.XPath("//p[contains(text(),'Certificates')]");

    // Continue Learning
    private By ContinueLearningTitle => By.XPath("//div[contains(text(),'Continue Learning')] | //h3[contains(text(),'Continue Learning')]");
    private By ViewAllLink => By.XPath("//a[contains(text(),'View all')]");
    private By EnrollmentCards => By.CssSelector("a[href*='/resources/'][class*='rounded-xl']");
    private By NoEnrollmentsMessage => By.XPath("//p[contains(text(),'enrolled in any resources')]");
    private By BrowseResourcesLink => By.XPath("//a[contains(text(),'Browse resources')]");

    // Sidebar
    private By SidebarOverview => By.XPath("//aside//a[contains(text(),'Overview')]");
    private By SidebarMyContent => By.XPath("//aside//a[contains(text(),'My Content')]");
    private By SidebarCertificates => By.XPath("//aside//a[contains(text(),'Certificates')]");
    private By SidebarMyExams => By.XPath("//aside//a[contains(text(),'My Exams')]");
    private By SidebarTransactions => By.XPath("//aside//a[contains(text(),'Transactions')]");
    private By SidebarProfile => By.XPath("//aside//a[contains(text(),'Profile')]");
    private By ActiveSidebarLink => By.CssSelector("aside a[class*='bg-primary']");

    public DashboardPage(IWebDriver driver) : base(driver) { }

    public DashboardPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        WaitForSpinnerToDisappear();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(WelcomeHeading);

    public string GetWelcomeText() => GetText(WelcomeHeading);

    public string GetSummaryText()
    {
        try { return GetText(SummaryText); }
        catch { return string.Empty; }
    }

    public bool ContainsUserName(string name) =>
        GetWelcomeText().Contains(name, StringComparison.OrdinalIgnoreCase);

    // Stats
    public int GetStatsCardCount()
    {
        try { return Driver.FindElements(StatsCards).Count; }
        catch { return 0; }
    }

    public string GetEnrolledCount()
    {
        try { return GetText(EnrolledStat); }
        catch { return "0"; }
    }

    public string GetExamsTakenCount()
    {
        try { return GetText(ExamsTakenStat); }
        catch { return "0"; }
    }

    public string GetCertificatesCount()
    {
        try { return GetText(CertificatesStat); }
        catch { return "0"; }
    }

    public bool AreStatsLabelsDisplayed() =>
        IsElementDisplayed(EnrolledLabel) &&
        IsElementDisplayed(ExamsTakenLabel) &&
        IsElementDisplayed(CertificatesLabel);

    // Continue Learning
    public bool IsContinueLearningVisible() => IsElementDisplayed(ContinueLearningTitle);

    public bool IsViewAllLinkVisible() => IsElementDisplayed(ViewAllLink);

    public int GetEnrollmentCardCount()
    {
        try { return Driver.FindElements(EnrollmentCards).Count; }
        catch { return 0; }
    }

    public bool IsNoEnrollmentsMessageVisible() => IsElementDisplayed(NoEnrollmentsMessage);

    public void ClickViewAll() => Click(ViewAllLink);

    public void ClickBrowseResources() => Click(BrowseResourcesLink);

    // Sidebar navigation
    public bool IsSidebarVisible() => IsElementDisplayed(SidebarOverview);

    public void ClickSidebarOverview() => Click(SidebarOverview);

    public void ClickSidebarMyContent() => Click(SidebarMyContent);

    public void ClickSidebarCertificates() => Click(SidebarCertificates);

    public void ClickSidebarMyExams() => Click(SidebarMyExams);

    public bool IsMyExamsSidebarVisible() => IsElementDisplayed(SidebarMyExams);

    public string GetActiveSidebarText()
    {
        try { return GetText(ActiveSidebarLink); }
        catch { return string.Empty; }
    }
}
