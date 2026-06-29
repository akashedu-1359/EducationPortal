using FluentAssertions;
using NUnit.Framework;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Admin;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("AdminCms")]
public class AdminCmsTests : BaseTest
{
    private AdminCmsPage _cmsPage = null!;
    private AuthHelper _auth = null!;

    public override void SetUp()
    {
        base.SetUp();
        _cmsPage = new AdminCmsPage(Driver);
        _auth = new AuthHelper(Driver, Settings);
    }

    private void LoginAsAdmin()
    {
        if (string.IsNullOrEmpty(Settings.AdminEmail) || string.IsNullOrEmpty(Settings.AdminPassword))
            Assert.Ignore("Admin credentials not configured");
        _auth.LoginAsAdmin();
    }

    [Test, Order(1)]
    public void CmsBanners_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToBanners();

        _cmsPage.IsBannersPageLoaded().Should().BeTrue("Banners page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Banners page should have content");
    }

    [Test, Order(2)]
    public void CmsPages_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToPages();

        _cmsPage.IsPagesPageLoaded().Should().BeTrue("Pages page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Pages management should have content");
    }

    [Test, Order(3)]
    public void CmsFaqs_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToFaqs();

        _cmsPage.IsFaqsPageLoaded().Should().BeTrue("FAQs page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("FAQs page should have content");
    }

    [Test, Order(4)]
    public void CmsFooter_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToFooter();

        _cmsPage.IsFooterPageLoaded().Should().BeTrue("Footer page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Footer settings should have content");
    }

    [Test, Order(5)]
    public void CmsSections_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToSections();

        _cmsPage.IsSectionsPageLoaded().Should().BeTrue("Sections page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Sections page should have content");
    }

    [Test, Order(6)]
    public void CmsSettings_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToSettings();

        _cmsPage.IsSettingsPageLoaded().Should().BeTrue("Settings page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Settings page should have content");
    }

    [Test, Order(7)]
    public void CmsFeatureFlags_PageLoads()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToFeatureFlags();

        _cmsPage.IsFeatureFlagsPageLoaded().Should().BeTrue("Feature Flags page heading should be visible");
        _cmsPage.IsPageLoaded().Should().BeTrue("Feature Flags page should have content");
    }

    [Test, Order(8)]
    public void CmsBanners_HasManagementControls()
    {
        LoginAsAdmin();
        _cmsPage.NavigateToBanners();

        var hasControls = _cmsPage.IsNewBannerButtonDisplayed() || _cmsPage.GetBannerCardCount() > 0 || _cmsPage.IsTableDisplayed();
        hasControls.Should().BeTrue("Banners page should have management controls (add button, cards, or table)");
    }
}
