using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminDashboardPage : BasePage
{
    private const string PagePath = "/admin";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Dashboard')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Platform-wide')]");

    // KPI Cards
    private By KpiCards => By.CssSelector("div[class*='grid'] div[class*='rounded-xl'][class*='shadow-card']");
    private By TotalUsersKpi => By.XPath("//p[contains(text(),'Total Users')]");
    private By ResourcesKpi => By.XPath("//p[contains(text(),'Resources') and contains(@class,'text-sm')]");
    private By RevenueKpi => By.XPath("//p[contains(text(),'Revenue')]");
    private By CertificatesKpi => By.XPath("//p[contains(text(),'Certificates') and contains(@class,'text-sm')]");
    private By KpiValues => By.CssSelector("div[class*='grid'] p[class*='text-3xl']");

    // Recent Activity
    private By RecentActivityHeading => By.XPath("//h2[contains(text(),'Recent Activity')]");
    private By ActivityItems => By.CssSelector("div[class*='divide-y'] > div[class*='flex']");
    private By NoActivityMessage => By.XPath("//p[contains(text(),'No activity')]");
    private By ActivityBadges => By.CssSelector("div[class*='divide-y'] [class*='badge']");

    // Admin Sidebar
    private By AdminSidebar => By.CssSelector("aside, nav[class*='sidebar'], div[class*='sidebar']");
    private By SidebarDashboard => By.XPath("//aside//a[contains(text(),'Dashboard')] | //nav//a[contains(text(),'Dashboard')]");
    private By SidebarResources => By.XPath("//aside//a[contains(text(),'Resources')] | //nav//a[contains(text(),'Resources')]");
    private By SidebarCategories => By.XPath("//aside//a[contains(text(),'Categories')] | //nav//a[contains(text(),'Categories')]");
    private By SidebarExams => By.XPath("//aside//a[contains(text(),'Exams')] | //nav//a[contains(text(),'Exams')]");
    private By SidebarUsers => By.XPath("//aside//a[contains(text(),'Users')] | //nav//a[contains(text(),'Users')]");
    private By SidebarAnalytics => By.XPath("//aside//a[contains(text(),'Analytics')] | //nav//a[contains(text(),'Analytics')]");
    private By SidebarCms => By.XPath("//aside//a[contains(text(),'CMS')] | //nav//a[contains(text(),'CMS')]");

    // Admin header
    private By AdminHeader => By.CssSelector("header, div[class*='AdminHeader']");

    public AdminDashboardPage(IWebDriver driver) : base(driver) { }

    public AdminDashboardPage NavigateTo()
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

    // KPI Cards
    public int GetKpiCardCount()
    {
        try { return Driver.FindElements(KpiCards).Count; }
        catch { return 0; }
    }

    public bool IsTotalUsersKpiDisplayed() => IsElementDisplayed(TotalUsersKpi);

    public bool IsResourcesKpiDisplayed() => IsElementDisplayed(ResourcesKpi);

    public bool IsRevenueKpiDisplayed() => IsElementDisplayed(RevenueKpi);

    public bool IsCertificatesKpiDisplayed() => IsElementDisplayed(CertificatesKpi);

    public bool AreAllKpisDisplayed() =>
        IsTotalUsersKpiDisplayed() &&
        IsResourcesKpiDisplayed() &&
        IsRevenueKpiDisplayed() &&
        IsCertificatesKpiDisplayed();

    public IReadOnlyList<string> GetKpiValues()
    {
        try
        {
            return Driver.FindElements(KpiValues).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    // Recent Activity
    public bool IsRecentActivityDisplayed() => IsElementDisplayed(RecentActivityHeading);

    public int GetActivityItemCount()
    {
        try { return Driver.FindElements(ActivityItems).Count; }
        catch { return 0; }
    }

    public bool IsNoActivityMessageDisplayed() => IsElementDisplayed(NoActivityMessage);

    // Sidebar
    public bool IsSidebarVisible() => IsElementDisplayed(AdminSidebar);

    public void ClickSidebarResources() => Click(SidebarResources);

    public void ClickSidebarCategories() => Click(SidebarCategories);

    public void ClickSidebarExams() => Click(SidebarExams);

    public void ClickSidebarUsers() => Click(SidebarUsers);

    public void ClickSidebarAnalytics() => Click(SidebarAnalytics);

    public void ClickSidebarCms() => Click(SidebarCms);

    public bool IsAdminHeaderDisplayed() => IsElementDisplayed(AdminHeader);
}
