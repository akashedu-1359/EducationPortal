using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Admin;

public class AdminCategoriesPage : BasePage
{
    private const string PagePath = "/admin/categories";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'Categories')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Organise')]");
    private By NewCategoryButton => By.XPath("//button[contains(text(),'New Category')]");
    private By SearchInput => By.CssSelector("input[placeholder*='Search categories']");

    // Category grid
    private By CategoryCards => By.CssSelector("div[class*='grid'] div[class*='rounded-xl'][class*='shadow-card']");
    private By CategoryNames => By.CssSelector("div[class*='grid'] p[class*='font-semibold']");
    private By CategoryDescriptions => By.CssSelector("div[class*='grid'] p[class*='text-slate-500']");
    private By CategoryResourceCounts => By.CssSelector("div[class*='grid'] [class*='badge']");
    private By NoCategoriesMessage => By.XPath("//p[contains(text(),'No categories')]");
    private By CreateCategoryFallback => By.XPath("//button[contains(text(),'Create Category')]");

    // Edit/Delete buttons
    private By EditButtons => By.CssSelector("button[aria-label*='Edit']");
    private By DeleteButtons => By.CssSelector("button[aria-label*='Delete']");

    // Create/Edit Modal
    private By ModalTitle => By.XPath("//h2[contains(text(),'Category')] | //h3[contains(text(),'Category')]");
    private By NameInput => By.CssSelector("input[placeholder*='Web Development']");
    private By DescriptionInput => By.CssSelector("input[placeholder*='Brief description']");
    private By ModalSaveButton => By.XPath("//button[contains(text(),'Create') or contains(text(),'Save')]");
    private By ModalCancelButton => By.XPath("//button[contains(text(),'Cancel')]");
    private By NameError => By.CssSelector("p[class*='text-red']");

    // Delete Modal
    private By DeleteModalTitle => By.XPath("//h2[contains(text(),'Delete Category')] | //h3[contains(text(),'Delete Category')]");
    private By DeleteConfirmButton => By.XPath("//button[contains(text(),'Delete') and not(contains(text(),'Category'))]");
    private By DeleteCancelButton => By.XPath("//button[contains(text(),'Cancel')]");

    public AdminCategoriesPage(IWebDriver driver) : base(driver) { }

    public AdminCategoriesPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        return this;
    }

    // Verification
    public bool IsPageLoaded() => IsElementDisplayed(PageTitle);

    public string GetPageTitleText() => GetText(PageTitle);

    public bool IsNewCategoryButtonDisplayed() => IsElementDisplayed(NewCategoryButton);

    public bool IsSearchInputDisplayed() => IsElementDisplayed(SearchInput);

    // Categories
    public int GetCategoryCount()
    {
        try { return Driver.FindElements(CategoryCards).Count; }
        catch { return 0; }
    }

    public IReadOnlyList<string> GetCategoryNames()
    {
        try
        {
            return Driver.FindElements(CategoryNames).Select(e => e.Text).ToList();
        }
        catch { return Array.Empty<string>(); }
    }

    public bool IsNoCategoriesMessageDisplayed() => IsElementDisplayed(NoCategoriesMessage);

    public bool CategoryExists(string name)
    {
        var names = GetCategoryNames();
        return names.Any(n => n.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    // Interactions
    public void ClickNewCategory() => Click(NewCategoryButton);

    public void Search(string query) => ClearAndType(SearchInput, query);

    public void ClickEditCategory(int index)
    {
        var buttons = Driver.FindElements(EditButtons);
        if (index < buttons.Count) buttons[index].Click();
    }

    public void ClickDeleteCategory(int index)
    {
        var buttons = Driver.FindElements(DeleteButtons);
        if (index < buttons.Count) buttons[index].Click();
    }

    // Create/Edit Modal
    public bool IsModalDisplayed() => IsElementDisplayed(ModalTitle);

    public void EnterCategoryName(string name) => ClearAndType(NameInput, name);

    public void EnterCategoryDescription(string desc) => ClearAndType(DescriptionInput, desc);

    public void ClickSave() => Click(ModalSaveButton);

    public void ClickCancel() => Click(ModalCancelButton);

    public void CreateCategory(string name, string description = "")
    {
        ClickNewCategory();
        Thread.Sleep(300);
        EnterCategoryName(name);
        if (!string.IsNullOrEmpty(description))
            EnterCategoryDescription(description);
        ClickSave();
    }

    public bool HasNameError() => IsElementDisplayed(NameError);

    // Delete Modal
    public bool IsDeleteModalDisplayed() => IsElementDisplayed(DeleteModalTitle);

    public void ConfirmDelete() => Click(DeleteConfirmButton);

    public void CancelDelete() => Click(DeleteCancelButton);

    public void DeleteCategory(int index)
    {
        ClickDeleteCategory(index);
        Thread.Sleep(300);
        ConfirmDelete();
    }
}
