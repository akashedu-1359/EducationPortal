using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Exams;

public class ExamsListPage : BasePage
{
    private const string PagePath = "/exams";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Exams')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Test your knowledge')]");
    private By SearchInput => By.CssSelector("input[placeholder*='Search exams']");
    private By ExamCards => By.CssSelector("div[class*='grid'] a[href*='/exams/'], div[class*='grid'] [class*='rounded-xl'][class*='shadow']");
    private By ExamTitles => By.CssSelector("div[class*='grid'] [class*='font-semibold'], div[class*='grid'] h3");
    private By NoExamsMessage => By.XPath("//p[contains(text(),'No exams found')]");
    private By NoExamsDescription => By.XPath("//p[contains(text(),'Check back later') or contains(text(),'search terms')]");
    private By NoExamsIcon => By.CssSelector("svg.lucide-book-open");
    private By PaginationContainer => By.CssSelector("[class*='pagination']");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public ExamsListPage(IWebDriver driver) : base(driver) { }

    public ExamsListPage NavigateTo()
    {
        NavigateToUrl(PagePath);
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

    // Exam cards
    public int GetExamCardCount()
    {
        try
        {
            WaitForSpinnerToDisappear();
            return Driver.FindElements(ExamCards).Count;
        }
        catch { return 0; }
    }

    public bool HasExams() => GetExamCardCount() > 0;

    public IReadOnlyList<string> GetExamTitles()
    {
        try
        {
            return Driver.FindElements(ExamTitles)
                .Select(e => e.Text)
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool IsNoExamsMessageDisplayed() => IsElementDisplayed(NoExamsMessage);

    public bool IsPaginationDisplayed() => IsElementDisplayed(PaginationContainer);

    // Interactions
    public void Search(string query)
    {
        ClearAndType(SearchInput, query);
        Thread.Sleep(500);
    }

    public void ClearSearch()
    {
        var element = FindElement(SearchInput);
        element.Clear();
        Thread.Sleep(500);
    }

    public void ClickExamCard(int index)
    {
        var cards = Driver.FindElements(ExamCards);
        if (index < cards.Count)
        {
            Wait.ScrollToElement(cards[index]);
            cards[index].Click();
        }
    }

    public void ClickFirstExam() => ClickExamCard(0);

    // Aliases for test compatibility
    public bool IsPageHeadingVisible() => IsPageLoaded();

    public bool IsSearchInputVisible() => IsSearchInputDisplayed();

    public bool IsSubtitleVisible() => IsElementDisplayed(PageSubtitle);

    public void SearchExams(string query) => Search(query);

    public IReadOnlyList<IWebElement> GetExamCards()
    {
        try
        {
            WaitForSpinnerToDisappear();
            return Driver.FindElements(ExamCards);
        }
        catch { return Array.Empty<IWebElement>(); }
    }
}
