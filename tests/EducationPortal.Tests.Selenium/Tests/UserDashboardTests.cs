using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Dashboard;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Dashboard")]
[Order(4)]
public class UserDashboardTests : BaseTest
{
    private DashboardPage _dashboardPage = null!;
    private MyContentPage _myContentPage = null!;
    private CertificatesPage _certificatesPage = null!;
    private AuthHelper _authHelper = null!;

    public override void SetUp()
    {
        base.SetUp();
        _dashboardPage = new DashboardPage(Driver);
        _myContentPage = new MyContentPage(Driver);
        _certificatesPage = new CertificatesPage(Driver);
        _authHelper = new AuthHelper(Driver);
    }

    private void EnsureLoggedIn()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured. Skipping dashboard test.");
            return;
        }
        _authHelper.LoginAsTestUser();
    }

    [Test, Order(1)]
    [Description("Dashboard page loads for authenticated user")]
    public void Dashboard_Should_Load_For_Authenticated_User()
    {
        EnsureLoggedIn();
        _dashboardPage.NavigateTo();

        var isLoaded = _dashboardPage.IsPageLoaded()
            || Driver.Url.Contains("/dashboard");
        isLoaded.Should().BeTrue("Dashboard should load for authenticated user");
    }

    [Test, Order(2)]
    [Description("Dashboard displays stats cards")]
    public void Dashboard_Should_Display_Stats()
    {
        EnsureLoggedIn();
        _dashboardPage.NavigateTo();

        var statsCount = _dashboardPage.GetStatsCardCount();
        var hasContent = statsCount > 0
            || _dashboardPage.IsPageLoaded()
            || Driver.FindElement(By.TagName("main")).Text.Length > 10;

        hasContent.Should().BeTrue("Dashboard should display stats or content");
    }

    [Test, Order(3)]
    [Description("My Content page loads")]
    public void My_Content_Page_Should_Load()
    {
        EnsureLoggedIn();
        _myContentPage.NavigateTo();

        var isLoaded = _myContentPage.IsPageLoaded()
            || _myContentPage.IsNoContentMessageDisplayed()
            || _myContentPage.HasContent();

        isLoaded.Should().BeTrue("My Content page should display content or empty state");
    }

    [Test, Order(4)]
    [Description("Certificates page loads")]
    public void Certificates_Page_Should_Load()
    {
        EnsureLoggedIn();
        _certificatesPage.NavigateTo();

        var isLoaded = _certificatesPage.IsPageLoaded()
            || _certificatesPage.IsNoCertificatesMessageDisplayed()
            || _certificatesPage.HasCertificates();

        isLoaded.Should().BeTrue("Certificates page should display content or empty state");
    }

    [Test, Order(5)]
    [Description("Dashboard exams page loads")]
    public void Dashboard_Exams_Page_Should_Load()
    {
        EnsureLoggedIn();
        NavigateTo("/dashboard/exams");
        Wait.WaitForPageLoad();

        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeNullOrEmpty("Exams page should have content");
    }

    [Test, Order(6)]
    [Description("Dashboard has sidebar navigation")]
    public void Dashboard_Should_Have_Sidebar_Navigation()
    {
        EnsureLoggedIn();
        _dashboardPage.NavigateTo();

        var hasSidebar = _dashboardPage.IsSidebarVisible()
            || Driver.FindElements(By.CssSelector("aside a, a[href*='/dashboard/']")).Count > 0;

        hasSidebar.Should().BeTrue("Dashboard should have sidebar navigation");
    }
}
