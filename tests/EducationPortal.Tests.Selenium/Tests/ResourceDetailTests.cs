using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Public;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Resources")]
[Order(5)]
public class ResourceDetailTests : BaseTest
{
    private ResourceDetailPage _detailPage = null!;
    private ResourcesPage _resourcesPage = null!;
    private AuthHelper _authHelper = null!;
    private string? _firstResourceSlug;

    public override void SetUp()
    {
        base.SetUp();
        _detailPage = new ResourceDetailPage(Driver);
        _resourcesPage = new ResourcesPage(Driver);
        _authHelper = new AuthHelper(Driver);
    }

    private string GetFirstResourceSlug()
    {
        if (_firstResourceSlug != null) return _firstResourceSlug;

        _resourcesPage.NavigateTo();
        var href = _resourcesPage.GetResourceCardHref(0);

        if (string.IsNullOrEmpty(href))
        {
            Assert.Ignore("No resources available to test detail page.");
            return string.Empty;
        }

        var parts = href.TrimEnd('/').Split('/');
        _firstResourceSlug = parts.Last();
        return _firstResourceSlug;
    }

    [Test, Order(1)]
    [Description("Resource detail page loads with valid slug")]
    public void Resource_Detail_Should_Load()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        _detailPage.IsPageLoaded().Should().BeTrue("Resource detail page should load");
    }

    [Test, Order(2)]
    [Description("Resource detail page displays title")]
    public void Resource_Detail_Should_Display_Title()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        var title = _detailPage.GetResourceTitle();
        title.Should().NotBeNullOrEmpty("Resource should have a title");
    }

    [Test, Order(3)]
    [Description("Resource detail page displays description")]
    public void Resource_Detail_Should_Display_Description()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        var hasDescription = !string.IsNullOrEmpty(_detailPage.GetDescription())
            || _detailPage.IsAboutSectionDisplayed();
        hasDescription.Should().BeTrue("Resource should have description or about section");
    }

    [Test, Order(4)]
    [Description("Resource detail page shows type badge")]
    public void Resource_Detail_Should_Show_Type_Badge()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        var badgeText = _detailPage.GetTypeBadgeText();
        if (string.IsNullOrEmpty(badgeText))
        {
            var hasBadgeElement = _detailPage.IsTypeBadgePresent();
            if (!hasBadgeElement)
            {
                Assert.Ignore("Resource does not have a visible type badge element");
                return;
            }
        }
        badgeText.Should().NotBeNullOrEmpty("Resource type badge, when present, should have text");
    }

    [Test, Order(5)]
    [Description("Resource detail page has breadcrumb")]
    public void Resource_Detail_Should_Have_Breadcrumb()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        _detailPage.IsBreadcrumbDisplayed().Should().BeTrue("Resource should have breadcrumb navigation");
    }

    [Test, Order(6)]
    [Description("Resource detail page has enroll/access button")]
    public void Resource_Detail_Should_Have_Action_Button()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        _detailPage.HasAnyAccessButton().Should().BeTrue("Resource should have an access/action button");
    }

    [Test, Order(7)]
    [Description("Resource detail shows enrollment count")]
    public void Resource_Detail_Should_Show_Enrollment_Count()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        var countText = _detailPage.GetEnrollmentCountText();
        var mainText = Driver.FindElement(By.TagName("main")).Text;

        var hasEnrollmentInfo = !string.IsNullOrEmpty(countText)
            || mainText.Contains("enrolled", StringComparison.OrdinalIgnoreCase)
            || mainText.Contains("student", StringComparison.OrdinalIgnoreCase);

        hasEnrollmentInfo.Should().BeTrue("Resource should show enrollment info");
    }

    [Test, Order(8)]
    [Description("Resource detail page sets document title")]
    public void Resource_Detail_Should_Set_Document_Title()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        Driver.Title.Should().NotBeNullOrEmpty("Document title should be set");
    }

    [Test, Order(9)]
    [Description("Non-existent resource shows 404")]
    public void Non_Existent_Resource_Should_Show_404()
    {
        _detailPage.NavigateTo(TestDataHelper.NonExistentSlug);
        Thread.Sleep(2000);

        var is404 = _detailPage.IsNotFoundDisplayed()
            || Driver.Title.Contains("404", StringComparison.OrdinalIgnoreCase)
            || Driver.FindElement(By.TagName("body")).Text.Contains("not found", StringComparison.OrdinalIgnoreCase);

        is404.Should().BeTrue("Non-existent resource should show 404 page");
    }

    [Test, Order(10)]
    [Description("Breadcrumb links navigate to resources page")]
    public void Breadcrumb_Should_Navigate_To_Resources()
    {
        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        if (!_detailPage.IsBreadcrumbDisplayed())
        {
            Assert.Ignore("No breadcrumb found on this page.");
            return;
        }

        _detailPage.ClickBreadcrumbResources();
        Wait.WaitForPageLoad();

        Driver.Url.Should().Contain("/resources", "Breadcrumb should navigate to resources page");
    }

    [Test, Order(11)]
    [Description("Free resource shows access button for authenticated user")]
    public void Free_Resource_Should_Show_Access_Button_For_Auth_User()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }

        _authHelper.LoginAsTestUser();

        var slug = GetFirstResourceSlug();
        _detailPage.NavigateTo(slug);

        _detailPage.HasAnyAccessButton().Should().BeTrue(
            "Resource should have an action button for authenticated users");
    }
}
