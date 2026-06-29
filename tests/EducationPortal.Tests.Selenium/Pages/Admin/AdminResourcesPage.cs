using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminResourcesPage : BasePage
{
    private const string PagePath = "/admin/resources";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Resources')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Manage all video')]");
    private By AddResourceButton => By.XPath("//button[contains(text(),'Add Resource')]");
    private By SearchInput => By.CssSelector("input[placeholder*='Search resources']");
    private By TypeFilter => By.XPath("//select[.//option[contains(text(),'All types')]]");

    // Table
    private By ResourceTable => By.TagName("table");
    private By TableHeaders => By.CssSelector("table thead th");
    private By TableRows => By.CssSelector("table tbody tr");
    private By ResourceTitlesInTable => By.CssSelector("table tbody tr td:first-child p[class*='font-medium']");
    private By NoResourcesMessage => By.XPath("//td[contains(text(),'No resources found')]");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    // Action buttons (per row)
    private By EditButtons => By.CssSelector("table tbody button[title='Edit']");
    private By PublishButtons => By.CssSelector("table tbody button[title='Publish']");
    private By ArchiveButtons => By.CssSelector("table tbody button[title='Archive']");

    // Pagination
    private By PaginationContainer => By.CssSelector("[class*='pagination']");

    // Archive modal
    private By ArchiveModalTitle => By.XPath("//h2[contains(text(),'Archive Resource')] | //h3[contains(text(),'Archive Resource')]");
    private By ArchiveConfirmButton => By.XPath("//button[contains(text(),'Archive') and not(contains(text(),'Resource'))]");
    private By ArchiveCancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    public AdminResourcesPage(IWebDriver driver) : base(driver) { }

    public AdminResourcesPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public bool IsAddResourceButtonDisplayed() => IsElementDisplayed(AddResourceButton);

    public bool IsSearchInputDisplayed() => IsElementDisplayed(SearchInput);

    public bool IsTypeFilterDisplayed() => IsElementDisplayed(TypeFilter);

    public bool IsTableDisplayed() => IsElementDisplayed(ResourceTable);

    // Table data
    public int GetTableRowCount()
    {
        try
        {
            WaitForSpinnerToDisappear();
            var rows = Driver.FindElements(TableRows);
            return rows.Count(r => !r.Text.Contains("No resources"));
        }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetResourceTitles()
    {
        try
        {
            return Driver.FindElements(ResourceTitlesInTable).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public IReadOnlyList<string> GetTableHeaderTexts()
    {
        try
        {
            return Driver.FindElements(TableHeaders).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool IsNoResourcesMessageDisplayed() => IsElementDisplayed(NoResourcesMessage);

    // Interactions
    public void ClickAddResource() => Click(AddResourceButton);

    public void Search(string query) => ClearAndType(SearchInput, query);

    public void ClickEditResource(int rowIndex)
    {
        var buttons = Driver.FindElements(EditButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    public void ClickPublishResource(int rowIndex)
    {
        var buttons = Driver.FindElements(PublishButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    public void ClickArchiveResource(int rowIndex)
    {
        var buttons = Driver.FindElements(ArchiveButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    // Archive modal
    public bool IsArchiveModalDisplayed() => IsElementDisplayed(ArchiveModalTitle);

    public void ConfirmArchive() => Click(ArchiveConfirmButton);

    public void CancelArchive() => Click(ArchiveCancelButton);

    // Pagination
    public bool IsPaginationDisplayed() => IsElementDisplayed(PaginationContainer);
}
