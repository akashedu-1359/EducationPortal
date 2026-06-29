using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Public;

public class ResourcesPage : BasePage
{
    private const string PagePath = "/resources";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Browse Resources')]");
    private By PageSubtitle => By.CssSelector(".page-subtitle");
    private By SearchInput => By.CssSelector("input[placeholder*='Search resources']");
    private By TypeFilter => By.XPath("//select[.//option[contains(text(),'All types')]]");
    private By PricingFilter => By.XPath("//select[.//option[contains(text(),'All pricing')]]");
    private By CategoryFilter => By.XPath("//select[.//option[contains(text(),'All categories')]]");
    private By ResourceCards => By.CssSelector("a[href*='/resources/'][class*='rounded-2xl']");
    private By ResourceTitles => By.CssSelector("a[href*='/resources/'] p[class*='font-semibold']");
    private By ResourceTypeBadges => By.CssSelector("a[href*='/resources/'] [class*='badge']");
    private By NoResultsMessage => By.XPath("//p[contains(text(),'No resources found')]");
    private By NoResultsIcon => By.CssSelector("svg.lucide-book-open");
    private By PaginationContainer => By.CssSelector("[class*='pagination'], nav[aria-label*='pagination']");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public ResourcesPage(IWebDriver driver) : base(driver) { }

    public ResourcesPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    public ResourcesPage NavigateWithSearch(string query)
    {
        NavigateToUrl($"{PagePath}?search={Uri.EscapeDataString(query)}");
        WaitForPageLoad();
        return this;
    }

    public ResourcesPage NavigateWithType(string type)
    {
        NavigateToUrl($"{PagePath}?type={type}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public string GetSubtitleText()
    {
        try { return GetText(PageSubtitle); }
        catch { return string.Empty; }
    }

    public bool IsSearchInputDisplayed() => IsElementDisplayed(SearchInput);

    public bool IsTypeFilterDisplayed() => IsElementDisplayed(TypeFilter);

    public bool IsPricingFilterDisplayed() => IsElementDisplayed(PricingFilter);

    public bool AreFiltersDisplayed() =>
        IsSearchInputDisplayed() && IsTypeFilterDisplayed() && IsPricingFilterDisplayed();

    // Resource cards
    public int GetResourceCardCount()
    {
        try
        {
            WaitForSpinnerToDisappear();
            return Driver.FindElements(ResourceCards).Count;
        }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetResourceTitles()
    {
        try
        {
            var elements = Driver.FindElements(ResourceTitles);
            return elements.Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool HasResources() => GetResourceCardCount() > 0;

    public bool IsNoResultsDisplayed() => IsElementDisplayed(NoResultsMessage);

    public bool IsPaginationDisplayed() => IsElementDisplayed(PaginationContainer);

    // Interactions
    public void Search(string query)
    {
        ClearAndType(SearchInput, query);
        Thread.Sleep(500); // debounce
    }

    public void ClearSearch()
    {
        var element = FindElement(SearchInput);
        element.Clear();
        Thread.Sleep(500);
    }

    public void SelectType(string type) => SelectByValue(TypeFilter, type);

    public void SelectPricing(string pricing) => SelectByValue(PricingFilter, pricing);

    public void ClickResourceCard(int index)
    {
        var cards = Driver.FindElements(ResourceCards);
        if (index < cards.Count)
        {
            Wait.ScrollToElement(cards[index]);
            cards[index].Click();
        }
    }

    public void ClickFirstResource()
    {
        ClickResourceCard(0);
    }

    public string GetFirstResourceTitle()
    {
        try
        {
            var titles = Driver.FindElements(ResourceTitles);
            return titles.Count > 0 ? titles[0].Text : string.Empty;
        }
        catch { return string.Empty; }
    }

    public string GetResourceCardHref(int index)
    {
        try
        {
            var cards = Driver.FindElements(ResourceCards);
            return index < cards.Count ? (cards[index].GetAttribute("href") ?? string.Empty) : string.Empty;
        }
        catch { return string.Empty; }
    }
}
