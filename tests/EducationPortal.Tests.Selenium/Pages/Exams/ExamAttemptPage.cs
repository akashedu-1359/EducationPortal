using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Exams;

public class ExamAttemptPage : BasePage
{
    // Header bar
    private By ExamLabel => By.XPath("//p[contains(@class,'font-semibold') and contains(text(),'Exam')]");
    private By AnsweredProgress => By.XPath("//p[contains(text(),'answered')]");
    private By TimerDisplay => By.CssSelector("div[class*='font-mono']");
    private By SubmitExamButton => By.XPath("//button[contains(text(),'Submit Exam')]");

    // Question navigation (sidebar)
    private By QuestionButtons => By.CssSelector("div[class*='grid-cols-5'] button");
    private By CurrentQuestionButton => By.CssSelector("div[class*='grid-cols-5'] button[class*='bg-primary-600']");
    private By AnsweredQuestionButtons => By.CssSelector("div[class*='grid-cols-5'] button[class*='bg-green']");
    private By UnansweredQuestionButtons => By.CssSelector("div[class*='grid-cols-5'] button[class*='bg-white']");

    // Question area
    private By QuestionCounter => By.XPath("//span[contains(text(),'Question') and contains(text(),'of')]");
    private By QuestionText => By.CssSelector("p[class*='text-lg'][class*='font-semibold']");
    private By OptionButtons => By.CssSelector("button[class*='rounded-xl'][class*='border-2'][class*='w-full']");
    private By SelectedOption => By.CssSelector("button[class*='border-primary-500'][class*='bg-primary-50']");

    // Navigation buttons
    private By PreviousButton => By.XPath("//button[contains(text(),'Previous')]");
    private By NextButton => By.XPath("//button[contains(text(),'Next')]");

    // Legend
    private By CurrentLegend => By.XPath("//div[contains(text(),'Current')]");
    private By AnsweredLegend => By.XPath("//div[contains(text(),'Answered')]");
    private By UnansweredLegend => By.XPath("//div[contains(text(),'Unanswered')]");

    // Time warning
    private By TimeWarningBar => By.CssSelector("div[class*='bg-red-50']");

    public ExamAttemptPage(IWebDriver driver) : base(driver) { }

    public new ExamAttemptPage NavigateTo(string slug)
    {
        NavigateToUrl($"/exams/{slug}/attempt");
        WaitForPageLoad();
        WaitForSpinnerToDisappear();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(QuestionText) || IsElementDisplayed(ExamLabel);

    public string GetExamLabel()
    {
        try { return GetText(ExamLabel); }
        catch { return string.Empty; }
    }

    public string GetAnsweredProgress()
    {
        try { return GetText(AnsweredProgress); }
        catch { return string.Empty; }
    }

    public string GetTimerText()
    {
        try { return GetText(TimerDisplay); }
        catch { return string.Empty; }
    }

    public bool IsTimerDisplayed() => IsElementDisplayed(TimerDisplay);

    public bool IsTimeWarningActive() => IsElementDisplayed(TimeWarningBar);

    // Question
    public string GetQuestionCounter()
    {
        try { return GetText(QuestionCounter); }
        catch { return string.Empty; }
    }

    public string GetQuestionText()
    {
        try { return GetText(QuestionText); }
        catch { return string.Empty; }
    }

    public int GetOptionCount()
    {
        try { return Driver.FindElements(OptionButtons).Count; }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetOptionTexts()
    {
        try
        {
            return Driver.FindElements(OptionButtons).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public void SelectOption(int index)
    {
        var options = Driver.FindElements(OptionButtons);
        if (index < options.Count)
        {
            Wait.ScrollToElement(options[index]);
            options[index].Click();
        }
    }

    public bool IsOptionSelected(int index)
    {
        try
        {
            var options = Driver.FindElements(OptionButtons);
            if (index >= options.Count) return false;
            var classes = options[index].GetAttribute("class") ?? "";
            return classes.Contains("border-primary");
        }
        catch { return false; }
    }

    public bool HasSelectedOption() => IsElementPresent(SelectedOption);

    // Navigation
    public void ClickPrevious() => Click(PreviousButton);

    public void ClickNext() => Click(NextButton);

    public bool IsPreviousEnabled()
    {
        try { return FindElement(PreviousButton).Enabled; }
        catch { return false; }
    }

    public bool IsNextEnabled()
    {
        try { return FindElement(NextButton).Enabled; }
        catch { return false; }
    }

    public void GoToQuestion(int number)
    {
        var buttons = Driver.FindElements(QuestionButtons);
        if (number - 1 < buttons.Count)
        {
            buttons[number - 1].Click();
            Thread.Sleep(300);
        }
    }

    // Question sidebar
    public int GetTotalQuestionCount()
    {
        try { return Driver.FindElements(QuestionButtons).Count; }
        catch { return 0; }
    }

    public int GetAnsweredQuestionCount()
    {
        try { return Driver.FindElements(AnsweredQuestionButtons).Count; }
        catch { return 0; }
    }

    // Submit
    public void ClickSubmitExam() => Click(SubmitExamButton);

    public bool IsSubmitButtonDisplayed() => IsElementDisplayed(SubmitExamButton);

    // Answer all questions (for automation)
    public void AnswerAllQuestionsWithFirstOption()
    {
        var total = GetTotalQuestionCount();
        for (int i = 0; i < total; i++)
        {
            GoToQuestion(i + 1);
            Thread.Sleep(300);
            SelectOption(0);
            Thread.Sleep(200);
        }
    }
}
