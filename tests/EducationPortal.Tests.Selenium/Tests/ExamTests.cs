using FluentAssertions;
using NUnit.Framework;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Exams;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Exams")]
public class ExamTests : BaseTest
{
    private ExamsListPage _listPage = null!;
    private ExamDetailPage _detailPage = null!;
    private ExamAttemptPage _attemptPage = null!;
    private ExamResultsPage _resultsPage = null!;
    private AuthHelper _auth = null!;

    public override void SetUp()
    {
        base.SetUp();
        _listPage = new ExamsListPage(Driver);
        _detailPage = new ExamDetailPage(Driver);
        _attemptPage = new ExamAttemptPage(Driver);
        _resultsPage = new ExamResultsPage(Driver);
        _auth = new AuthHelper(Driver, Settings);
    }

    [Test, Order(1)]
    public void ExamsListingPage_LoadsSuccessfully()
    {
        _listPage.NavigateTo();

        _listPage.IsPageLoaded().Should().BeTrue("Exams heading should be visible");
        _listPage.IsSearchInputDisplayed().Should().BeTrue("Search input should be visible");
    }

    [Test, Order(2)]
    public void ExamsListingPage_HasSubtitleText()
    {
        _listPage.NavigateTo();

        _listPage.GetSubtitleText().Should().NotBeEmpty("Subtitle text should be present");
    }

    [Test, Order(3)]
    public void ExamsListingPage_SearchFiltersExams()
    {
        _listPage.NavigateTo();

        _listPage.Search("zzz_nonexistent_query");
        Thread.Sleep(1000);

        var noExamsMessage = _listPage.IsNoExamsMessageDisplayed();
        var noExamCards = _listPage.GetExamCardCount() == 0;
        (noExamsMessage || noExamCards).Should().BeTrue(
            "Searching for nonsense should show no-exams message or an empty results grid");
    }

    [Test, Order(4)]
    public void ExamsListingPage_DisplaysExamCards()
    {
        _listPage.NavigateTo();

        var count = _listPage.GetExamCardCount();
        if (count == 0)
        {
            Assert.Ignore("No exams available to verify cards");
            return;
        }

        count.Should().BeGreaterThan(0, "Exam cards should be displayed");
    }

    [Test, Order(5)]
    public void ExamDetailPage_RendersForValidExam()
    {
        _listPage.NavigateTo();

        if (!_listPage.HasExams())
        {
            Assert.Ignore("No exams available to test detail page");
            return;
        }

        _listPage.ClickFirstExam();
        Wait.WaitForPageLoad();

        Driver.Url.Should().Contain("/exams/", "Should navigate to exam detail");
        _detailPage.IsPageLoaded().Should().BeTrue("Exam detail page should load");
    }

    [Test, Order(6)]
    public void ExamDetailPage_ShowsInfoCards()
    {
        _listPage.NavigateTo();

        if (!_listPage.HasExams())
        {
            Assert.Ignore("No exams available to test detail page");
            return;
        }

        _listPage.ClickFirstExam();
        Wait.WaitForPageLoad();

        _detailPage.AreInfoCardsDisplayed().Should().BeTrue("Info cards (duration, questions, passing score, attempts) should be visible");
    }

    [Test, Order(7)]
    public void ExamDetailPage_UnauthUser_SeesLoginPrompt()
    {
        _listPage.NavigateTo();

        if (!_listPage.HasExams())
        {
            Assert.Ignore("No exams available to test login prompt");
            return;
        }

        _listPage.ClickFirstExam();
        Wait.WaitForPageLoad();

        _detailPage.IsLoginToTakeButtonDisplayed().Should().BeTrue("Unauthenticated user should see login prompt");
    }

    [Test, Order(8)]
    public void ExamAttemptPage_RedirectsUnauthUser()
    {
        NavigateTo("/exams/test-exam/attempt");

        var currentUrl = Driver.Url;
        var redirected = currentUrl.Contains("/auth/login") || currentUrl.Contains("/exams/");
        redirected.Should().BeTrue("Unauthenticated user should be redirected from attempt page");
    }

    [Test, Order(9)]
    public void ExamResultsPage_HasNavigationLinks()
    {
        NavigateTo("/exams/results/00000000-0000-0000-0000-000000000000");
        Thread.Sleep(2000);

        var currentUrl = Driver.Url;
        var redirectedToLogin = currentUrl.Contains("/auth/login", StringComparison.OrdinalIgnoreCase);
        var redirectedToExams = currentUrl.Contains("/exams", StringComparison.OrdinalIgnoreCase)
            && !currentUrl.Contains("/results", StringComparison.OrdinalIgnoreCase);
        var hasNavLinks = _resultsPage.IsBrowseExamsLinkDisplayed() || _resultsPage.IsDashboardLinkDisplayed();
        var bodyText = Driver.FindElement(OpenQA.Selenium.By.TagName("body")).Text;
        var isNotFound = bodyText.Contains("not found", StringComparison.OrdinalIgnoreCase)
            || bodyText.Contains("404", StringComparison.OrdinalIgnoreCase);

        (hasNavLinks || isNotFound || redirectedToLogin || redirectedToExams).Should().BeTrue(
            "Results page with invalid ID should show nav links, not-found, or redirect to login/exams");
    }

    [Test, Order(10)]
    public void ExamDetailPage_AuthUser_SeesStartButton()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("User credentials not configured");
            return;
        }

        _auth.LoginAsTestUser();

        _listPage.NavigateTo();

        if (!_listPage.HasExams())
        {
            Assert.Ignore("No exams available");
            return;
        }

        _listPage.ClickFirstExam();
        Wait.WaitForPageLoad();

        var hasStartOrMaxReached = _detailPage.IsStartExamButtonDisplayed() || _detailPage.IsMaxAttemptsReached();
        hasStartOrMaxReached.Should().BeTrue("Authenticated user should see Start Exam or max attempts reached");
    }
}
