import { SiteConfig, Configurations, CommunityTemplate } from '../../../../types';

export function filterAndSortSites(
  source: string,
  sourceArgument: string | null,
  configurations: Configurations,
  quiqrCommunityTemplates: CommunityTemplate[],
  sitesListingView: string
): { sites: SiteConfig[]; listTitle: string } {
  let listingSource = '';
  let listTitle = '';
  let sites: SiteConfig[] = [];

  // Determine the listing source
  if (source === 'last') {
    listingSource = sitesListingView;
    if (listingSource && listingSource.includes('local-tags-')) {
      sourceArgument = listingSource.split('tags-')[1];
      listingSource = 'tags';
    }
  } else {
    listingSource = source;
  }

  // Filter sites based on source
  if (
    listingSource === 'quiqr-community-templates' ||
    (listingSource === 'last' && sitesListingView === 'templates-quiqr-community')
  ) {
    listTitle = 'Quiqr Community Templates';

    sites = [];
    quiqrCommunityTemplates.forEach((template) => {
      let screenshotURL: string | undefined = undefined;
      if (template.ScreenshotImageType) {
        screenshotURL =
          'https://quiqr.github.io/quiqr-community-templates/templates/' +
          template.NormalizedName +
          '/screenshot.' +
          template.ScreenshotImageType;
      }

      sites.push({
        key: 'template-' + template.QuiqrEtalageName,
        name: template.QuiqrEtalageName,
        screenshotURL: screenshotURL,
        homepageURL: template.QuiqrEtalageHomepage,
        importSiteURL: template.SourceLink.trim(),
        template: true,
      } as SiteConfig);
    });
  } else if (listingSource === 'tags') {
    listTitle = 'Sites in tag: ' + sourceArgument;
    sites = configurations.sites.filter((site) => {
      return site.tags && site.tags.includes(sourceArgument);
    });
  } else {
    listTitle = 'All sites on this computer';
    sites = configurations.sites || [];
  }

  // Sort sites alphabetically
  sites.sort(function (a, b) {
    const nameA = a.name.toLowerCase(),
      nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return { sites, listTitle };
}
