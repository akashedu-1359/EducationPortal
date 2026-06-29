using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Public;

public class HomePage : BasePage
{
    private const string PagePath = "/";

    // Hero section
    private By HeroSection => By.CssSelector("section[class*='bg-gradient']");
    private By HeroTitle => By.CssSelector("section[class*='bg-gradient'] h1");
    private By HeroSubtitle => By.CssSelector("section[class*='bg-gradient'] p[class*='text-slate-300']");
    private By HeroBadge => By.XPath("//span[contains(text(),'Learn without limits')]");
    private By BrowseResourcesButton => By.XPath("//section[contains(@class,'bg-gradient')]//a[contains(text(),'Browse Resources') or contains(text(),'Browse')]");
    private By CreateFreeAccountHero => By.XPath("//section[contains(@class,'bg-gradient')]//a[contains(text(),'Create Free Account')]");

    // Features section
    private By FeaturesSection => By.XPath("//section[.//h2[contains(text(),'Everything you need')]]");
    private By FeaturesHeading => By.XPath("//h2[contains(text(),'Everything you need')]");
    private By FeatureCards => By.CssSelector("section:not([class*='bg-slate-50']):not([class*='bg-primary']) .shadow-card");
    private By VideoCoursesFeature => By.XPath("//h3[contains(text(),'Video Courses')]");
    private By PdfResourcesFeature => By.XPath("//h3[contains(text(),'PDF Resources')]");
    private By BlogArticlesFeature => By.XPath("//h3[contains(text(),'Blog Articles')]");
    private By CertificatesFeature => By.XPath("//h3[contains(text(),'Certificates')]");

    // How it Works section
    private By HowItWorksSection => By.CssSelector("section[class*='bg-slate-50']");
    private By HowItWorksHeading => By.XPath("//h2[contains(text(),'How it works')]");
    private By HowItWorksSteps => By.CssSelector("section[class*='bg-slate-50'] .rounded-full[class*='bg-primary']");

    // CTA section
    private By CtaSection => By.CssSelector("section[class*='bg-primary-600']");
    private By CtaHeading => By.XPath("//section[contains(@class,'bg-primary')]//h2[contains(text(),'Start learning')]");
    private By CtaCreateAccount => By.XPath("//section[contains(@class,'bg-primary')]//a[contains(text(),'Create Free Account')]");
    private By CtaBenefits => By.XPath("//section[contains(@class,'bg-primary')]//span[contains(@class,'flex')]");

    // Announcement banners
    private By AnnouncementBanners => By.CssSelector("div[class*='bg-primary-600'][class*='text-center']");

    public HomePage(IWebDriver driver) : base(driver) { }

    public HomePage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Hero verification
    public bool IsHeroSectionVisible() => IsElementDisplayed(HeroSection);

    public string GetHeroTitle() => GetText(HeroTitle);

    public string GetHeroSubtitle() => GetText(HeroSubtitle);

    public bool IsHeroBadgeVisible() => IsElementDisplayed(HeroBadge);

    public bool IsBrowseResourcesButtonVisible() => IsElementDisplayed(BrowseResourcesButton);

    public bool IsCreateFreeAccountHeroVisible() => IsElementDisplayed(CreateFreeAccountHero);

    // Features verification
    public bool IsFeaturesVisible() => IsElementDisplayed(FeaturesHeading);

    public string GetFeaturesHeading() => GetText(FeaturesHeading);

    public int GetFeatureCardCount()
    {
        try { return Driver.FindElements(FeatureCards).Count; }
        catch { return 0; }
    }

    public bool IsVideoCoursesFeatureVisible() => IsElementDisplayed(VideoCoursesFeature);

    public bool IsPdfResourcesFeatureVisible() => IsElementDisplayed(PdfResourcesFeature);

    public bool IsBlogArticlesFeatureVisible() => IsElementDisplayed(BlogArticlesFeature);

    public bool IsCertificatesFeatureVisible() => IsElementDisplayed(CertificatesFeature);

    public bool AreAllFeaturesVisible() =>
        IsVideoCoursesFeatureVisible() &&
        IsPdfResourcesFeatureVisible() &&
        IsBlogArticlesFeatureVisible() &&
        IsCertificatesFeatureVisible();

    // How It Works
    public bool IsHowItWorksSectionVisible() => IsElementDisplayed(HowItWorksSection);

    public string GetHowItWorksHeading() => GetText(HowItWorksHeading);

    public int GetHowItWorksStepCount()
    {
        try { return Driver.FindElements(HowItWorksSteps).Count; }
        catch { return 0; }
    }

    // CTA
    public bool IsCtaSectionVisible() => IsElementDisplayed(CtaSection);

    public string GetCtaHeading() => GetText(CtaHeading);

    public bool IsCtaCreateAccountVisible() => IsElementDisplayed(CtaCreateAccount);

    public int GetCtaBenefitsCount()
    {
        try { return Driver.FindElements(CtaBenefits).Count; }
        catch { return 0; }
    }

    // Interactions
    public void ClickBrowseResources() => Click(BrowseResourcesButton);

    public void ClickCreateFreeAccountHero() => Click(CreateFreeAccountHero);

    public void ClickCtaCreateAccount() => Click(CtaCreateAccount);

    // Announcements
    public bool HasAnnouncementBanners() => IsElementPresent(AnnouncementBanners);

    public int GetAnnouncementBannerCount()
    {
        try { return Driver.FindElements(AnnouncementBanners).Count; }
        catch { return 0; }
    }

    // Full page verification
    public bool IsFullPageLoaded() =>
        IsHeroSectionVisible() &&
        IsFeaturesVisible() &&
        IsHowItWorksSectionVisible() &&
        IsCtaSectionVisible();
}
