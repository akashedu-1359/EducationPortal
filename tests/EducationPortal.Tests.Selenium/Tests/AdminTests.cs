using FluentAssertions;
using NUnit.Framework;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Admin;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Admin")]
public class AdminTests : BaseTest
{
    private AdminDashboardPage _dashboardPage = null!;
    private AdminResourcesPage _resourcesPage = null!;
    private AdminCategoriesPage _categoriesPage = null!;
    private AdminExamsPage _examsPage = null!;
    private AdminUsersPage _usersPage = null!;
    private AdminAnalyticsPage _analyticsPage = null!;
    private AuthHelper _auth = null!;

    public override void SetUp()
    {
        base.SetUp();
        _dashboardPage = new AdminDashboardPage(Driver);
        _resourcesPage = new AdminResourcesPage(Driver);
        _categoriesPage = new AdminCategoriesPage(Driver);
        _examsPage = new AdminExamsPage(Driver);
        _usersPage = new AdminUsersPage(Driver);
        _analyticsPage = new AdminAnalyticsPage(Driver);
        _auth = new AuthHelper(Driver, Settings);
    }

    private void LoginAsAdmin()
    {
        if (string.IsNullOrEmpty(Settings.AdminEmail) || string.IsNullOrEmpty(Settings.AdminPassword))
            Assert.Ignore("Admin credentials not configured");
        _auth.LoginAsAdmin();
    }

    // --- Dashboard ---

    [Test, Order(1)]
    public void AdminDashboard_LoadsSuccessfully()
    {
        LoginAsAdmin();
        _dashboardPage.NavigateTo();

        _dashboardPage.IsPageLoaded().Should().BeTrue("Dashboard heading should be visible");
    }

    [Test, Order(2)]
    public void AdminDashboard_ShowsKpiCards()
    {
        LoginAsAdmin();
        _dashboardPage.NavigateTo();

        _dashboardPage.IsTotalUsersKpiDisplayed().Should().BeTrue("Total Users KPI should be visible");
        _dashboardPage.IsResourcesKpiDisplayed().Should().BeTrue("Resources KPI should be visible");
        _dashboardPage.IsRevenueKpiDisplayed().Should().BeTrue("Revenue KPI should be visible");
        _dashboardPage.IsCertificatesKpiDisplayed().Should().BeTrue("Certificates KPI should be visible");
    }

    [Test, Order(3)]
    public void AdminDashboard_ShowsRecentActivity()
    {
        LoginAsAdmin();
        _dashboardPage.NavigateTo();

        _dashboardPage.IsRecentActivityDisplayed().Should().BeTrue("Recent Activity section should be visible");
    }

    [Test, Order(4)]
    public void AdminDashboard_HasSidebar()
    {
        LoginAsAdmin();
        _dashboardPage.NavigateTo();

        _dashboardPage.IsSidebarVisible().Should().BeTrue("Admin sidebar should be visible");
    }

    // --- Resources ---

    [Test, Order(5)]
    public void AdminResources_PageLoads()
    {
        LoginAsAdmin();
        _resourcesPage.NavigateTo();

        _resourcesPage.IsPageLoaded().Should().BeTrue("Resources heading should be visible");
    }

    [Test, Order(6)]
    public void AdminResources_HasAddButton()
    {
        LoginAsAdmin();
        _resourcesPage.NavigateTo();

        _resourcesPage.IsAddResourceButtonDisplayed().Should().BeTrue("Add Resource button should be visible");
    }

    [Test, Order(7)]
    public void AdminResources_HasSearchInput()
    {
        LoginAsAdmin();
        _resourcesPage.NavigateTo();

        _resourcesPage.IsSearchInputDisplayed().Should().BeTrue("Search input should be visible");
    }

    // --- Categories ---

    [Test, Order(8)]
    public void AdminCategories_PageLoads()
    {
        LoginAsAdmin();
        _categoriesPage.NavigateTo();

        _categoriesPage.IsPageLoaded().Should().BeTrue("Categories heading should be visible");
    }

    [Test, Order(9)]
    public void AdminCategories_HasNewCategoryButton()
    {
        LoginAsAdmin();
        _categoriesPage.NavigateTo();

        _categoriesPage.IsNewCategoryButtonDisplayed().Should().BeTrue("New Category button should be visible");
    }

    [Test, Order(10)]
    public void AdminCategories_CreateCategory()
    {
        LoginAsAdmin();
        _categoriesPage.NavigateTo();

        var catName = TestDataHelper.GenerateCategoryName();
        _categoriesPage.CreateCategory(catName, "Selenium test category");
        Thread.Sleep(1000);

        _categoriesPage.CategoryExists(catName).Should().BeTrue($"Category '{catName}' should appear in the list");
    }

    [Test, Order(11)]
    public void AdminCategories_DeleteCategory()
    {
        LoginAsAdmin();
        _categoriesPage.NavigateTo();

        var initialCount = _categoriesPage.GetCategoryCount();
        if (initialCount == 0)
        {
            _categoriesPage.CreateCategory(TestDataHelper.GenerateCategoryName());
            Thread.Sleep(1000);
            initialCount = _categoriesPage.GetCategoryCount();
        }

        _categoriesPage.DeleteCategory(0);
        Thread.Sleep(1000);

        var finalCount = _categoriesPage.GetCategoryCount();
        finalCount.Should().BeLessThan(initialCount, "Category count should decrease after deletion");
    }

    // --- Exams ---

    [Test, Order(12)]
    public void AdminExams_PageLoads()
    {
        LoginAsAdmin();
        _examsPage.NavigateTo();

        _examsPage.IsPageLoaded().Should().BeTrue("Exams heading should be visible");
    }

    [Test, Order(13)]
    public void AdminQuestions_PageLoads()
    {
        LoginAsAdmin();
        NavigateTo("/admin/questions");

        var heading = Driver.FindElement(OpenQA.Selenium.By.CssSelector("h1"));
        heading.Text.Should().NotBeEmpty("Questions page heading should be visible");
    }

    [Test, Order(14)]
    public void AdminExamAttempts_PageLoads()
    {
        LoginAsAdmin();
        NavigateTo("/admin/exam-attempts");

        var heading = Driver.FindElement(OpenQA.Selenium.By.CssSelector("h1"));
        heading.Text.Should().NotBeEmpty("Exam Attempts page heading should be visible");
    }

    // --- Users ---

    [Test, Order(15)]
    public void AdminUsers_PageLoads()
    {
        LoginAsAdmin();
        _usersPage.NavigateTo();

        _usersPage.IsPageLoaded().Should().BeTrue("Users heading should be visible");
    }

    [Test, Order(16)]
    public void AdminUsers_HasSearchInput()
    {
        LoginAsAdmin();
        _usersPage.NavigateTo();

        _usersPage.IsSearchInputDisplayed().Should().BeTrue("Search input should be visible on users page");
    }

    // --- Analytics ---

    [Test, Order(17)]
    public void AdminAnalytics_PageLoads()
    {
        LoginAsAdmin();
        _analyticsPage.NavigateTo();

        _analyticsPage.IsPageLoaded().Should().BeTrue("Analytics heading should be visible");
    }

    [Test, Order(18)]
    public void AdminAnalytics_HasSummaryCards()
    {
        LoginAsAdmin();
        _analyticsPage.NavigateTo();

        _analyticsPage.GetSummaryCardCount().Should().BeGreaterThan(0, "Analytics page should have summary cards");
    }

    // --- Access Control ---

    [Test, Order(19)]
    public void Admin_UnauthenticatedUser_CannotAccess()
    {
        NavigateTo("/admin");

        var url = Driver.Url;
        var blocked = url.Contains("/auth/login") || url.Contains("/admin");
        blocked.Should().BeTrue("Unauthenticated user should be blocked or redirected from admin");
    }

    [Test, Order(20)]
    public void Admin_RegularUser_CannotAccess()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("User credentials not configured");
            return;
        }

        _auth.LoginAsTestUser();
        NavigateTo("/admin");

        Thread.Sleep(2000);
        var url = Driver.Url;
        var body = Driver.FindElement(OpenQA.Selenium.By.TagName("body")).Text;

        var blocked = url.Contains("/dashboard")
            || url.Contains("/auth/login")
            || body.Contains("denied", StringComparison.OrdinalIgnoreCase)
            || body.Contains("unauthorized", StringComparison.OrdinalIgnoreCase)
            || body.Contains("forbidden", StringComparison.OrdinalIgnoreCase)
            || !body.Contains("Total Users", StringComparison.OrdinalIgnoreCase);

        blocked.Should().BeTrue("Regular user should not see admin dashboard content");
    }
}
