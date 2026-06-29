using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Public;

public class CmsPage : BasePage
{
    // Locators
    private By PageHeading => By.CssSelector("h1");
    private By PageContent => By.CssSelector("main");
    private By ContentBody => By.CssSelector("article, main .prose, main div[class*='container']");
    private By NotFoundPage => By.XPath("//h1[contains(text(),'404')] | //h2[contains(text(),'not found')]");

    public CmsPage(IWebDriver driver) : base(driver) { }

    public new CmsPage NavigateTo(string slug)
    {
        NavigateToUrl($"/{slug}");
        WaitForPageLoad();
        return this;
    }

    public CmsPage NavigateToPrivacy()
    {
        NavigateToUrl("/privacy");
        WaitForPageLoad();
        return this;
    }

    public CmsPage NavigateToTerms()
    {
        NavigateToUrl("/terms");
        WaitForPageLoad();
        return this;
    }

    public CmsPage NavigateToFaq()
    {
        NavigateToUrl("/faq");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageContent);

    public string GetHeadingText()
    {
        try { return GetText(PageHeading); }
        catch { return string.Empty; }
    }

    public bool HasContent() => IsElementDisplayed(ContentBody);

    public bool IsNotFoundPage() => IsElementDisplayed(NotFoundPage);

    public string GetPageBodyText()
    {
        try { return GetText(PageContent); }
        catch { return string.Empty; }
    }

    public bool BodyContainsText(string text)
    {
        var body = GetPageBodyText();
        return body.Contains(text, StringComparison.OrdinalIgnoreCase);
    }
}
