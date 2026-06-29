using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Exams;

public class ExamResultsPage : BasePage
{
    // Locators
    private By ExamTitle => By.CssSelector("h1, h2");
    private By ScoreDisplay => By.CssSelector("[class*='text-4xl'], [class*='text-3xl']");
    private By PassedMessage => By.XPath("//p[contains(text(),'Congratulations')]");
    private By PassedDescription => By.XPath("//p[contains(text(),'passed this exam')]");
    private By FailedMessage => By.XPath("//p[contains(text(),'not pass') or contains(text(),'didn')]");
    private By MyExamsButton => By.XPath("//a[contains(text(),'My Exams')]");
    private By CertificateSection => By.CssSelector("div[class*='bg-green-50']");
    private By CertificateLink => By.XPath("//a[contains(text(),'Certificate') or contains(text(),'certificate')]");

    // Answer Review
    private By AnswerReviewHeading => By.XPath("//h2[contains(text(),'Answer Review')]");
    private By QuestionResults => By.CssSelector("div[class*='space-y-3'] > div");

    // Bottom navigation
    private By BrowseExamsLink => By.XPath("//a[contains(text(),'Browse Exams')]");
    private By DashboardLink => By.XPath("//a[contains(text(),'Go to Dashboard')]");

    // Summary stats
    private By TotalQuestionsInfo => By.XPath("//*[contains(text(),'questions')]");
    private By CorrectAnswersInfo => By.XPath("//*[contains(text(),'correct')]");
    private By PassingPercentageInfo => By.XPath("//*[contains(text(),'%')]");

    public ExamResultsPage(IWebDriver driver) : base(driver) { }

    public new ExamResultsPage NavigateTo(string attemptId)
    {
        NavigateToUrl($"/exams/results/{attemptId}");
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() =>
        IsElementDisplayed(ScoreDisplay) || IsElementDisplayed(ExamTitle);

    public string GetScore()
    {
        try { return GetText(ScoreDisplay); }
        catch { return string.Empty; }
    }

    public bool IsPassed() => IsElementDisplayed(PassedMessage);

    public bool IsFailed() => IsElementDisplayed(FailedMessage);

    public string GetPassedMessage()
    {
        try { return GetText(PassedMessage); }
        catch { return string.Empty; }
    }

    // Certificate
    public bool IsCertificateSectionDisplayed() => IsElementDisplayed(CertificateSection);

    public bool IsCertificateLinkDisplayed() => IsElementDisplayed(CertificateLink);

    public void ClickMyExams() => Click(MyExamsButton);

    // Answer Review
    public bool IsAnswerReviewDisplayed() => IsElementDisplayed(AnswerReviewHeading);

    public int GetQuestionResultCount()
    {
        try { return Driver.FindElements(QuestionResults).Count; }
        catch { return 0; }
    }

    // Navigation
    public bool IsBrowseExamsLinkDisplayed() => IsElementDisplayed(BrowseExamsLink);

    public bool IsDashboardLinkDisplayed() => IsElementDisplayed(DashboardLink);

    public void ClickBrowseExams() => Click(BrowseExamsLink);

    public void ClickDashboard() => Click(DashboardLink);

    public bool AreNavigationLinksDisplayed() =>
        IsBrowseExamsLinkDisplayed() && IsDashboardLinkDisplayed();

    // Aliases for test compatibility
    public bool IsBrowseExamsLinkVisible() => IsBrowseExamsLinkDisplayed();

    public bool IsDashboardLinkVisible() => IsDashboardLinkDisplayed();
}
