using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Public;

public class ResourceDetailPage : BasePage
{
    // Locators
    private By ResourceTitle => By.CssSelector("h1[class*='text-3xl']");
    private By ResourceDescription => By.XPath("//h2[contains(text(),'About this resource')]/following-sibling::p");
    private By AboutSection => By.XPath("//h2[contains(text(),'About this resource')]");
    private By TypeBadge => By.CssSelector(".lg\\:col-span-2 [class*='badge']:first-child");
    private By PricingBadge => By.XPath("//span[contains(@class,'badge') and (contains(text(),'Free') or contains(text(),'Paid'))]");
    private By DurationInfo => By.XPath("//span[contains(@class,'text-slate-500') and .//svg[contains(@class,'lucide-clock')]]");
    private By EnrollmentCount => By.XPath("//span[contains(@class,'text-slate-500') and contains(text(),'enrolled')]");
    private By Breadcrumb => By.CssSelector("nav[class*='text-sm'] a[href='/resources']");
    private By BreadcrumbCategory => By.CssSelector("nav[class*='text-sm'] span[class*='text-slate-600']");
    private By Thumbnail => By.CssSelector(".rounded-2xl img[alt]");
    private By AuthorName => By.CssSelector(".rounded-full + div p[class*='font-medium']");
    private By PublishDate => By.CssSelector(".rounded-full + div p:not([class*='font-medium'])");
    private By Tags => By.CssSelector("svg.lucide-tag ~ [class*='badge']");

    // Sidebar / CTA
    private By SidebarCard => By.CssSelector(".lg\\:col-span-1 .sticky");
    private By PurchaseButton => By.XPath("//a[contains(text(),'Purchase Access')]");
    private By WatchNowButton => By.XPath("//a[contains(text(),'Watch Now')]");
    private By ViewPdfButton => By.XPath("//a[contains(text(),'View PDF')]");
    private By ReadArticleButton => By.XPath("//a[contains(text(),'Read Article')]");
    private By SignInToAccessButton => By.XPath("//a[contains(text(),'Sign In to Access')]");
    private By EnrolledStatus => By.XPath("//p[contains(text(),'enrolled') or contains(text(),'Free access')]");
    private By PriceDisplay => By.CssSelector(".lg\\:col-span-1 p[class*='text-3xl']");

    // Related resources
    private By RelatedSection => By.XPath("//h2[contains(text(),'Related Resources')]");
    private By RelatedCards => By.CssSelector("h2:has(+ div a[href*='/resources/']) ~ div a, div:has(> h2) + div a[href*='/resources/']");

    // 404
    private By NotFoundMessage => By.XPath("//h2[contains(text(),'not found')] | //p[contains(text(),'not found')]");

    public ResourceDetailPage(IWebDriver driver) : base(driver) { }

    public new ResourceDetailPage NavigateTo(string slug)
    {
        NavigateToUrl($"/resources/{slug}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(ResourceTitle);

    public string GetResourceTitle() => GetText(ResourceTitle);

    public string GetDescription()
    {
        try { return GetText(ResourceDescription); }
        catch { return string.Empty; }
    }

    public bool IsAboutSectionDisplayed() => IsElementDisplayed(AboutSection);

    public string GetTypeBadgeText()
    {
        try { return GetText(TypeBadge); }
        catch { return string.Empty; }
    }

    public bool IsTypeBadgePresent() => IsElementPresent(TypeBadge);

    public bool IsDurationDisplayed() => IsElementDisplayed(DurationInfo);

    public string GetDurationText()
    {
        try { return GetText(DurationInfo); }
        catch { return string.Empty; }
    }

    public string GetEnrollmentCountText()
    {
        try { return GetText(EnrollmentCount); }
        catch { return string.Empty; }
    }

    // Breadcrumb
    public bool IsBreadcrumbDisplayed() => IsElementDisplayed(Breadcrumb);

    public string GetBreadcrumbCategoryText()
    {
        try { return GetText(BreadcrumbCategory); }
        catch { return string.Empty; }
    }

    public void ClickBreadcrumbResources() => Click(Breadcrumb);

    // Thumbnail
    public bool IsThumbnailDisplayed() => IsElementDisplayed(Thumbnail);

    // Author
    public string GetAuthorName()
    {
        try { return GetText(AuthorName); }
        catch { return string.Empty; }
    }

    public string GetPublishDate()
    {
        try { return GetText(PublishDate); }
        catch { return string.Empty; }
    }

    // Tags
    public int GetTagCount()
    {
        try { return Driver.FindElements(Tags).Count; }
        catch { return 0; }
    }

    // Sidebar / CTA
    public bool IsSidebarCardDisplayed() => IsElementDisplayed(SidebarCard);

    public bool IsPurchaseButtonDisplayed() => IsElementDisplayed(PurchaseButton);

    public bool IsWatchNowButtonDisplayed() => IsElementDisplayed(WatchNowButton);

    public bool IsViewPdfButtonDisplayed() => IsElementDisplayed(ViewPdfButton);

    public bool IsReadArticleButtonDisplayed() => IsElementDisplayed(ReadArticleButton);

    public bool IsSignInToAccessDisplayed() => IsElementDisplayed(SignInToAccessButton);

    public bool IsEnrolledStatusDisplayed() => IsElementDisplayed(EnrolledStatus);

    public string GetPriceText()
    {
        try { return GetText(PriceDisplay); }
        catch { return string.Empty; }
    }

    public bool HasAnyAccessButton() =>
        IsPurchaseButtonDisplayed() ||
        IsWatchNowButtonDisplayed() ||
        IsViewPdfButtonDisplayed() ||
        IsReadArticleButtonDisplayed() ||
        IsSignInToAccessDisplayed();

    public void ClickPurchaseAccess() => Click(PurchaseButton);

    public void ClickSignInToAccess() => Click(SignInToAccessButton);

    // Related resources
    public bool IsRelatedSectionDisplayed() => IsElementDisplayed(RelatedSection);

    // Not found
    public bool IsNotFoundDisplayed() => IsElementDisplayed(NotFoundMessage);
}
