using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminUsersPage : BasePage
{
    private const string PagePath = "/admin/users";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'User Management')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'View, manage roles')]");
    private By SearchInput => By.CssSelector("input[placeholder*='Search by name']");
    private By RoleFilter => By.XPath("//select[.//option[contains(text(),'All roles')]]");

    // Table
    private By UserTable => By.TagName("table");
    private By TableHeaders => By.CssSelector("table thead th");
    private By TableRows => By.CssSelector("table tbody tr");
    private By UserNames => By.CssSelector("table tbody p[class*='font-medium']");
    private By UserEmails => By.CssSelector("table tbody p[class*='text-xs'][class*='text-slate-400']");
    private By UserRoleBadges => By.CssSelector("table tbody [class*='badge']");
    private By NoUsersMessage => By.XPath("//td[contains(text(),'No users found')]");

    // Role change
    private By RoleSelects => By.CssSelector("table tbody select");

    // Active toggle
    private By ActiveToggleButtons => By.CssSelector("table tbody td:last-child button");

    // Pagination
    private By PaginationContainer => By.CssSelector("[class*='pagination']");

    // Confirm modal
    private By ConfirmModalTitle => By.XPath("//h2[contains(text(),'User')] | //h3[contains(text(),'User')]");
    private By ConfirmButton => By.XPath("//button[contains(text(),'Activate') or contains(text(),'Deactivate')]");
    private By CancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    public AdminUsersPage(IWebDriver driver) : base(driver) { }

    public AdminUsersPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public bool IsSearchInputDisplayed() => IsElementDisplayed(SearchInput);

    public bool IsRoleFilterDisplayed() => IsElementDisplayed(RoleFilter);

    public bool IsTableDisplayed() => IsElementDisplayed(UserTable);

    // Table
    public int GetTableRowCount()
    {
        try
        {
            WaitForSpinnerToDisappear();
            var rows = Driver.FindElements(TableRows);
            return rows.Count(r => !r.Text.Contains("No users"));
        }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetUserNames()
    {
        try
        {
            return Driver.FindElements(UserNames).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public IReadOnlyList<string> GetUserEmails()
    {
        try
        {
            return Driver.FindElements(UserEmails).Select(e => e.Text).ToList();
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

    public bool IsNoUsersMessageDisplayed() => IsElementDisplayed(NoUsersMessage);

    // Interactions
    public void Search(string query) => ClearAndType(SearchInput, query);

    public void ChangeUserRole(int rowIndex, string newRole)
    {
        var selects = Driver.FindElements(RoleSelects);
        if (rowIndex < selects.Count)
        {
            var select = new SelectElement(selects[rowIndex]);
            select.SelectByValue(newRole);
        }
    }

    public void ClickActiveToggle(int rowIndex)
    {
        var buttons = Driver.FindElements(ActiveToggleButtons);
        if (rowIndex < buttons.Count) buttons[rowIndex].Click();
    }

    // Confirm modal
    public bool IsConfirmModalDisplayed() => IsElementDisplayed(ConfirmModalTitle);

    public void ConfirmAction() => Click(ConfirmButton);

    public void CancelAction() => Click(CancelButton);

    // Pagination
    public bool IsPaginationDisplayed() => IsElementDisplayed(PaginationContainer);
}
