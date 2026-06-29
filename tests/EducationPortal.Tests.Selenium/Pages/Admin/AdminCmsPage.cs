using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminCmsPage : BasePage
{
    // Common CMS admin locators
    private new By PageTitle => By.CssSelector("h1[class*='page-title'], h1");
    private By PageSubtitle => By.CssSelector("p[class*='page-subtitle']");
    private By MainContent => By.TagName("main");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    // Banners page
    private By BannersTitle => By.XPath("//h1[contains(text(),'Banners')]");
    private By NewBannerButton => By.XPath("//button[contains(text(),'New Banner') or contains(text(),'Add Banner')]");
    private By BannerCards => By.CssSelector("[class*='rounded-xl'][class*='shadow']");

    // Pages page
    private By PagesTitle => By.XPath("//h1[contains(text(),'Pages')]");
    private By NewPageButton => By.XPath("//button[contains(text(),'New Page') or contains(text(),'Add Page')]");

    // FAQs page
    private By FaqsTitle => By.XPath("//h1[contains(text(),'FAQ')]");
    private By NewFaqButton => By.XPath("//button[contains(text(),'New FAQ') or contains(text(),'Add FAQ')]");
    private By FaqItems => By.CssSelector("[class*='rounded-xl'], [class*='accordion']");

    // Footer page
    private By FooterTitle => By.XPath("//h1[contains(text(),'Footer')]");

    // Sections page
    private By SectionsTitle => By.XPath("//h1[contains(text(),'Sections')]");

    // Settings page
    private By SettingsTitle => By.XPath("//h1[contains(text(),'Settings')]");
    private By SaveSettingsButton => By.XPath("//button[contains(text(),'Save')]");

    // Feature flags page
    private By FeatureFlagsTitle => By.XPath("//h1[contains(text(),'Feature')]");
    private By FeatureFlagToggles => By.CssSelector("input[type='checkbox'], button[role='switch']");

    // Common modal elements
    private By Modal => By.CssSelector("[role='dialog'], div[class*='fixed'][class*='inset']");
    private By ModalSaveButton => By.XPath("//button[contains(text(),'Save') or contains(text(),'Create')]");
    private By ModalCancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    // Tables (for pages that use tables)
    private By Table => By.TagName("table");
    private By TableRows => By.CssSelector("table tbody tr");

    public AdminCmsPage(IWebDriver driver) : base(driver) { }

    // Navigation methods for each CMS sub-page
    public AdminCmsPage NavigateToBanners()
    {
        NavigateToUrl("/admin/cms/banners");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToPages()
    {
        NavigateToUrl("/admin/cms/pages");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToFaqs()
    {
        NavigateToUrl("/admin/cms/faqs");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToFooter()
    {
        NavigateToUrl("/admin/cms/footer");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToSections()
    {
        NavigateToUrl("/admin/cms/sections");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToSettings()
    {
        NavigateToUrl("/admin/cms/settings");
        WaitForPageLoad();
        return this;
    }

    public AdminCmsPage NavigateToFeatureFlags()
    {
        NavigateToUrl("/admin/cms/feature-flags");
        WaitForPageLoad();
        return this;
    }

    // General verification
    public bool IsPageLoaded() => IsElementDisplayed(MainContent);

    public string GetPageTitleText()
    {
        try { return GetText(PageTitle); }
        catch { return string.Empty; }
    }

    // Banners
    public bool IsBannersPageLoaded() => IsElementDisplayed(BannersTitle);

    public bool IsNewBannerButtonDisplayed() => IsElementDisplayed(NewBannerButton);

    public void ClickNewBanner() => Click(NewBannerButton);

    public int GetBannerCardCount()
    {
        try { return Driver.FindElements(BannerCards).Count; }
        catch { return 0; }
    }

    // Pages
    public bool IsPagesPageLoaded() => IsElementDisplayed(PagesTitle);

    public bool IsNewPageButtonDisplayed() => IsElementDisplayed(NewPageButton);

    // FAQs
    public bool IsFaqsPageLoaded() => IsElementDisplayed(FaqsTitle);

    public bool IsNewFaqButtonDisplayed() => IsElementDisplayed(NewFaqButton);

    public int GetFaqItemCount()
    {
        try { return Driver.FindElements(FaqItems).Count; }
        catch { return 0; }
    }

    // Footer
    public bool IsFooterPageLoaded() => IsElementDisplayed(FooterTitle);

    // Sections
    public bool IsSectionsPageLoaded() => IsElementDisplayed(SectionsTitle);

    // Settings
    public bool IsSettingsPageLoaded() => IsElementDisplayed(SettingsTitle);

    public bool IsSaveSettingsButtonDisplayed() => IsElementDisplayed(SaveSettingsButton);

    public void ClickSaveSettings() => Click(SaveSettingsButton);

    // Feature Flags
    public bool IsFeatureFlagsPageLoaded() => IsElementDisplayed(FeatureFlagsTitle);

    public int GetFeatureFlagCount()
    {
        try { return Driver.FindElements(FeatureFlagToggles).Count; }
        catch { return 0; }
    }

    // Modal
    public bool IsModalDisplayed() => IsElementDisplayed(Modal);

    public void ClickModalSave() => Click(ModalSaveButton);

    public void ClickModalCancel() => Click(ModalCancelButton);

    // Table
    public bool IsTableDisplayed() => IsElementDisplayed(Table);

    public int GetTableRowCount()
    {
        try { return Driver.FindElements(TableRows).Count; }
        catch { return 0; }
    }

    // Generic CMS page load by path
    public AdminCmsPage NavigateToCmsSubPage(string subPage)
    {
        NavigateToUrl($"/admin/cms/{subPage}");
        WaitForPageLoad();
        return this;
    }

    // Aliases for test compatibility
    public bool IsPageHeadingVisible() => IsPageLoaded() && !string.IsNullOrEmpty(GetPageTitleText());

    public bool HasContentArea() => IsElementDisplayed(MainContent);
}
