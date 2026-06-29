using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminExamsPage : BasePage
{
    private const string PagePath = "/admin/exams";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Exams')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Create and manage')]");
    private By NewExamButton => By.XPath("//button[contains(text(),'New Exam')]");
    private By SearchInput => By.CssSelector("input[placeholder*='Search exams']");

    // Table
    private By ExamTable => By.TagName("table");
    private By TableHeaders => By.CssSelector("table thead th");
    private By TableRows => By.CssSelector("table tbody tr");
    private By ExamTitleLinks => By.CssSelector("table tbody a[href*='/admin/exams/']");
    private By NoExamsMessage => By.XPath("//td[contains(text(),'No exams found')]");

    // Action buttons
    private By EditButtons => By.CssSelector("table tbody button[title='Edit']");
    private By PublishButtons => By.CssSelector("table tbody button[title='Publish']");
    private By UnpublishButtons => By.CssSelector("table tbody button[title='Unpublish']");
    private By DeleteButtons => By.CssSelector("table tbody button[title='Delete']");

    // Pagination
    private By PaginationContainer => By.CssSelector("[class*='pagination']");

    // Create/Edit Modal
    private By ModalTitle => By.XPath("//h2[contains(text(),'Exam')] | //h3[contains(text(),'Exam')]");
    private By TitleInput => By.CssSelector("input[placeholder*='Exam title']");
    private By DescriptionTextarea => By.CssSelector("textarea[placeholder*='Describe']");
    private By PassingPercentageInput => By.CssSelector("input[type='number'][min='1'][max='100']");
    private By DurationInput => By.XPath("//label[contains(text(),'Duration')]/following-sibling::input | //label[contains(text(),'Duration')]/parent::div//input");
    private By MaxAttemptsInput => By.XPath("//label[contains(text(),'Max Attempts')]/following-sibling::input | //label[contains(text(),'Max Attempts')]/parent::div//input");
    private By CreateExamSubmitButton => By.XPath("//button[contains(text(),'Create Exam') or contains(text(),'Save Changes')]");
    private By ModalCancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    // Confirm modals
    private By PublishConfirmButton => By.XPath("//button[contains(text(),'Publish') and not(contains(text(),'Exam'))]");
    private By UnpublishConfirmButton => By.XPath("//button[contains(text(),'Unpublish') and not(contains(text(),'Exam'))]");
    private By DeleteConfirmButton => By.XPath("//button[contains(text(),'Delete') and not(contains(text(),'Exam'))]");
    private By ConfirmCancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    public AdminExamsPage(IWebDriver driver) : base(driver) { }

    public AdminExamsPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public bool IsNewExamButtonDisplayed() => IsElementDisplayed(NewExamButton);

    public bool IsSearchInputDisplayed() => IsElementDisplayed(SearchInput);

    public bool IsTableDisplayed() => IsElementDisplayed(ExamTable);

    // Table
    public int GetTableRowCount()
    {
        try
        {
            WaitForSpinnerToDisappear();
            var rows = Driver.FindElements(TableRows);
            return rows.Count(r => !r.Text.Contains("No exams"));
        }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetExamTitles()
    {
        try
        {
            return Driver.FindElements(ExamTitleLinks).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool IsNoExamsMessageDisplayed() => IsElementDisplayed(NoExamsMessage);

    // Interactions
    public void ClickNewExam() => Click(NewExamButton);

    public void Search(string query) => ClearAndType(SearchInput, query);

    public void ClickEditExam(int rowIndex)
    {
        var buttons = Driver.FindElements(EditButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    public void ClickPublishExam(int rowIndex)
    {
        var buttons = Driver.FindElements(PublishButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    public void ClickDeleteExam(int rowIndex)
    {
        var buttons = Driver.FindElements(DeleteButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    // Create Modal
    public bool IsModalDisplayed() => IsElementDisplayed(ModalTitle);

    public void FillExamForm(string title, string description, int passingPct = 60,
        int duration = 30, int maxAttempts = 3)
    {
        ClearAndType(TitleInput, title);
        ClearAndType(DescriptionTextarea, description);
    }

    public void ClickCreateExam() => Click(CreateExamSubmitButton);

    public void ClickCancelModal() => Click(ModalCancelButton);

    public void CreateExam(string title, string description)
    {
        ClickNewExam();
        Thread.Sleep(300);
        FillExamForm(title, description);
        ClickCreateExam();
    }

    // Confirm modals
    public void ConfirmPublish() => Click(PublishConfirmButton);

    public void ConfirmDelete() => Click(DeleteConfirmButton);

    public void CancelConfirm() => Click(ConfirmCancelButton);

    // Pagination
    public bool IsPaginationDisplayed() => IsElementDisplayed(PaginationContainer);
}
