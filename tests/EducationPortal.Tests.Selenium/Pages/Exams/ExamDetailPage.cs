using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Exams;

public class ExamDetailPage : BasePage
{
    // Locators
    private By ExamTitle => By.CssSelector("h1[class*='page-title']");
    private By ExamDescription => By.CssSelector("p[class*='page-subtitle']");

    // Info cards
    private By InfoCards => By.CssSelector("div[class*='grid'] div[class*='rounded-xl'][class*='text-center']");
    private By DurationCard => By.XPath("//p[contains(text(),'Duration')]/preceding-sibling::p");
    private By DurationLabel => By.XPath("//p[contains(text(),'Duration')]");
    private By QuestionsCard => By.XPath("//p[contains(text(),'Questions')]/preceding-sibling::p");
    private By QuestionsLabel => By.XPath("//p[contains(text(),'Questions')]");
    private By PassingScoreCard => By.XPath("//p[contains(text(),'Passing Score')]/preceding-sibling::p");
    private By PassingScoreLabel => By.XPath("//p[contains(text(),'Passing Score')]");
    private By AttemptsLeftCard => By.XPath("//p[contains(text(),'Attempts Left')]/preceding-sibling::p");
    private By AttemptsLeftLabel => By.XPath("//p[contains(text(),'Attempts Left')]");

    // CTA
    private By StartExamButton => By.XPath("//button[contains(text(),'Start Exam')]");
    private By LoginToTakeButton => By.XPath("//button[contains(text(),'Login to Take')] | //a[.//button[contains(text(),'Login')]]");
    private By MaxAttemptsMessage => By.XPath("//p[contains(text(),'Maximum attempts reached')]");

    // Past Attempts
    private By YourAttemptsHeading => By.XPath("//h2[contains(text(),'Your Attempts')]");
    private By AttemptCards => By.CssSelector("div[class*='rounded-xl'][class*='shadow-card'] .flex");
    private By NoAttemptsMessage => By.XPath("//p[contains(text(),'attempted this exam')]");
    private By ViewResultLinks => By.XPath("//a[contains(text(),'View Result')]");
    private By ContinueLinks => By.XPath("//a[contains(text(),'Continue')]");
    private By AttemptScores => By.CssSelector("span[class*='font-semibold'][class*='text-slate-900']");
    private By AttemptBadges => By.CssSelector("[class*='badge']");

    // Not found
    private By NotFoundMessage => By.XPath("//p[contains(text(),'Exam not found')]");
    private By BrowseExamsLink => By.XPath("//a[contains(text(),'Browse exams')]");

    public ExamDetailPage(IWebDriver driver) : base(driver) { }

    public new ExamDetailPage NavigateTo(string slug)
    {
        NavigateToUrl($"/exams/{slug}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(ExamTitle);

    public string GetExamTitle() => GetText(ExamTitle);

    public string GetExamDescription()
    {
        try { return GetText(ExamDescription); }
        catch { return string.Empty; }
    }

    public bool IsNotFound() => IsElementDisplayed(NotFoundMessage);

    // Info cards
    public int GetInfoCardCount()
    {
        try { return Driver.FindElements(InfoCards).Count; }
        catch { return 0; }
    }

    public string GetDuration()
    {
        try { return GetText(DurationCard); }
        catch { return string.Empty; }
    }

    public string GetQuestionCount()
    {
        try { return GetText(QuestionsCard); }
        catch { return string.Empty; }
    }

    public string GetPassingScore()
    {
        try { return GetText(PassingScoreCard); }
        catch { return string.Empty; }
    }

    public string GetAttemptsLeft()
    {
        try { return GetText(AttemptsLeftCard); }
        catch { return string.Empty; }
    }

    public bool AreInfoCardsDisplayed() =>
        IsElementDisplayed(DurationLabel) &&
        IsElementDisplayed(QuestionsLabel) &&
        IsElementDisplayed(PassingScoreLabel) &&
        IsElementDisplayed(AttemptsLeftLabel);

    // CTA
    public bool IsStartExamButtonDisplayed() => IsElementDisplayed(StartExamButton);

    public bool IsLoginToTakeButtonDisplayed() => IsElementDisplayed(LoginToTakeButton);

    public bool IsMaxAttemptsReached() => IsElementDisplayed(MaxAttemptsMessage);

    public void ClickStartExam() => Click(StartExamButton);

    public void ClickLoginToTake() => Click(LoginToTakeButton);

    // Attempts
    public bool IsYourAttemptsVisible() => IsElementDisplayed(YourAttemptsHeading);

    public bool IsNoAttemptsMessageVisible() => IsElementDisplayed(NoAttemptsMessage);

    public int GetAttemptCount()
    {
        try { return Driver.FindElements(ViewResultLinks).Count + Driver.FindElements(ContinueLinks).Count; }
        catch { return 0; }
    }

    public void ClickViewResult(int index = 0)
    {
        var links = Driver.FindElements(ViewResultLinks);
        if (index < links.Count)
        {
            Wait.ScrollToElement(links[index]);
            links[index].Click();
        }
    }

    public void ClickBrowseExams() => Click(BrowseExamsLink);

    // Aliases for test compatibility
    public bool IsStartExamButtonVisible() => IsStartExamButtonDisplayed();
}
