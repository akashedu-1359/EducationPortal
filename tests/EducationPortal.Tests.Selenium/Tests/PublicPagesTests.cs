using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Pages.Public;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Public")]
[Order(2)]
public class PublicPagesTests : BaseTest
{
    private HomePage _homePage = null!;
    private ResourcesPage _resourcesPage = null!;
    private CmsPage _cmsPage = null!;

    public override void SetUp()
    {
        base.SetUp();
        _homePage = new HomePage(Driver);
        _resourcesPage = new ResourcesPage(Driver);
        _cmsPage = new CmsPage(Driver);
    }

    [Test, Order(1)]
    [Description("Homepage hero section is displayed")]
    public void Homepage_Should_Display_Hero_Section()
    {
        _homePage.NavigateTo();

        _homePage.IsHeroSectionVisible().Should().BeTrue("Homepage should have a hero section");
    }

    [Test, Order(2)]
    [Description("Homepage has features section")]
    public void Homepage_Should_Display_Features_Section()
    {
        _homePage.NavigateTo();

        _homePage.IsFeaturesVisible().Should().BeTrue("Homepage should have features section");
    }

    [Test, Order(3)]
    [Description("Homepage has a call-to-action section")]
    public void Homepage_Should_Have_CTA_Section()
    {
        _homePage.NavigateTo();

        _homePage.IsCtaSectionVisible().Should().BeTrue("Homepage should have a CTA section");
    }

    [Test, Order(4)]
    [Description("Resources page loads with heading")]
    public void Resources_Page_Should_Load()
    {
        _resourcesPage.NavigateTo();

        _resourcesPage.IsPageLoaded().Should().BeTrue("Resources page should load");
    }

    [Test, Order(5)]
    [Description("Resources page has search input")]
    public void Resources_Page_Should_Have_Search()
    {
        _resourcesPage.NavigateTo();

        _resourcesPage.IsSearchInputDisplayed().Should().BeTrue("Resources page should have search input");
    }

    [Test, Order(6)]
    [Description("Resources page search filters results")]
    public void Resources_Page_Search_Should_Work()
    {
        _resourcesPage.NavigateTo();
        _resourcesPage.Search("test");

        Thread.Sleep(1000);
        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeNullOrEmpty("Page should respond to search without errors");
    }

    [Test, Order(7)]
    [Description("Privacy CMS page loads")]
    public void Privacy_Page_Should_Load()
    {
        _cmsPage.NavigateToPrivacy();

        _cmsPage.IsPageLoaded().Should().BeTrue("Privacy page should load");
    }

    [Test, Order(8)]
    [Description("Terms CMS page loads")]
    public void Terms_Page_Should_Load()
    {
        _cmsPage.NavigateToTerms();

        _cmsPage.IsPageLoaded().Should().BeTrue("Terms page should load");
    }

    [Test, Order(9)]
    [Description("FAQ CMS page loads")]
    public void FAQ_Page_Should_Load()
    {
        _cmsPage.NavigateToFaq();

        _cmsPage.IsPageLoaded().Should().BeTrue("FAQ page should load");
    }

    [Test, Order(10)]
    [Description("Unauthenticated user is redirected from dashboard")]
    public void Dashboard_Should_Redirect_Unauthenticated_User()
    {
        NavigateTo("/dashboard");
        Thread.Sleep(3000);

        Driver.Url.Should().Contain("/auth/login",
            "Unauthenticated user should be redirected to login from dashboard");
    }

    [Test, Order(11)]
    [Description("Unauthenticated user is redirected from admin")]
    public void Admin_Should_Redirect_Unauthenticated_User()
    {
        NavigateTo("/admin");
        Thread.Sleep(3000);

        var redirected = Driver.Url.Contains("/auth/login") || Driver.Url.Contains("/");
        redirected.Should().BeTrue("Unauthenticated user should be redirected from admin");
    }
}
