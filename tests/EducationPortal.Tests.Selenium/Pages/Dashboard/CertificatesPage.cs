using OpenQA.Selenium;

namespace EducationPortal.Tests.Selenium.Pages.Dashboard;

public class CertificatesPage : BasePage
{
    private const string PagePath = "/dashboard/certificates";

    // Locators
    private new By PageTitle => By.XPath("//h1[contains(text(),'My Certificates')]");
    private By PageSubtitle => By.XPath("//p[contains(text(),'Verifiable certificates')]");
    private By CertificateCards => By.CssSelector("[class*='rounded-2xl'], [class*='rounded-xl']");
    private By NoCertificatesMessage => By.XPath("//p[contains(text(),'No certificates yet')]");
    private By NoCertificatesDescription => By.XPath("//p[contains(text(),'Pass an exam')]");
    private By NoCertificatesIcon => By.CssSelector("svg.lucide-award");
    private By LoadingSkeleton => By.CssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public CertificatesPage(IWebDriver driver) : base(driver) { }

    public CertificatesPage NavigateTo()
    {
        NavigateToUrl(PagePath);
        WaitForPageLoad();
        WaitForSpinnerToDisappear();
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

    public bool IsNoCertificatesMessageDisplayed() => IsElementDisplayed(NoCertificatesMessage);

    public string GetNoCertificatesDescription()
    {
        try { return GetText(NoCertificatesDescription); }
        catch { return string.Empty; }
    }

    public bool IsNoCertificatesIconDisplayed() => IsElementDisplayed(NoCertificatesIcon);

    public int GetCertificateCount()
    {
        if (IsNoCertificatesMessageDisplayed()) return 0;
        try { return Driver.FindElements(CertificateCards).Count; }
        catch { return 0; }
    }

    public bool HasCertificates() => GetCertificateCount() > 0;
}
