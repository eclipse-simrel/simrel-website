var eclipse_org_common = { "settings": { "cookies_class": { "name": "eclipse_settings", "enabled": 1 } } };

window.onscroll = function() {
	const footer = document.querySelector("#footer>div>a");
	footer.style.display = document.documentElement.scrollTop > 100 ? 'inline' : 'none';
	updateTocSize();
};
window.onresize = updateTocSize;

const scriptBase = new URL(".", document.currentScript.src).href
const markdownBase = `${scriptBase}markdown/?file=`;

const file = getFileParameter();
const dotGitHub = /(?<root>wiki|profile)\/(?<path>.*)/.exec(file);
const parts = /(?<org>eclipse-(packaging|cbi))\/(?<repo>[^/]+)\/(?<branch>[^/]+)\/(?<path>.*)/.exec(file);
const org = parts != null ? parts.groups.org : 'eclipse-simrel';
const repo = parts != null ? parts.groups.repo : dotGitHub == null ? 'simrel-website' : '.github';
const branch = parts != null ? parts.groups.branch : 'main';
const path = parts != null ? parts.groups.path : dotGitHub == null ? file : `${dotGitHub.groups.root}/${dotGitHub.groups.path}`;
const selfHosted = repo == 'simrel-website';
const repoName = dotGitHub == null ? 'SimRel' : 'SimRel Wiki';

const isLocalHost = window.location.hostname == 'localhost';
const logicalBaseURL = new URL(`https://api.github.com/repos/${org}/${repo}/contents/${path}`);
const apiURL = `${logicalBaseURL}?ref=${branch}`;
const defaultURL = selfHosted ? `${scriptBase}${path.replace(/eclipse-simrel\/simrel-website\/main\//, '')}` : apiURL;
const localURL = new URL(file, window.location);

let meta = toElements(`
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="${(typeof favicon === 'undefined') ? 'images/simrel-logo.svg' : favicon}"/>
`);

let defaultHeader = toElements(`
	<a href="https://www.eclipse.org/downloads/packages/">Eclipse IDE</a>
	<a href="https://eclipseide.org/working-group/">Working Group</a>
	<a href="https://eclipseide.org/release/noteworthy/">New &amp; Noteworthy</a>
	<a href="https://marketplace.eclipse.org/">Marketplace</a>
`);

let defaultBreadcrumb = toElements(`
	<a href="https://eclipseide.org/">Home</a>
	<a href="https://eclipseide.org/projects/">Projects</a>
`);

let defaultNav = toElements(`
<a class="fa-download" href="https://www.eclipse.org/downloads/packages/"
	title="Download: Eclipse IDE">
	Download<p>Eclipse IDE</p>
</a>
<a class="fa-refresh" href="https://download.eclipse.org/releases/"
	title="Update: Sites">
	Updates<p>Sites</p>
</a>
<a class="fa-book" href="https://github.com/orgs/eclipse-simrel/discussions/3/" title="Documentation: Step by Step Instructions">
	Documentation<p>Step by Step Instructions</p>
</a>
<a class="fa-users" href="${scriptBase}?file=wiki/SimRel/Contributing_to_Simrel_Aggregation_Build.md"
	title="Contribution: Environment Setup">
	Contribution<p>Environment Setup</p>
</a>
<a class="fa-support" href="https://github.com/orgs/eclipse-simrel/discussions"
	title="Support: Discussions">
	Support<p>Discussions</p>
</a>
<a class="fa-bug" href="https://github.com/eclipse-simrel/simrel.build/issues"
	title="Issues: Bugs and Features">
	Issues<p>Bugs and Features</p>
</a>
`);

let currentReleaseCycle = getCurrentReleaseCycle();

let projectAside = `
<a class="separator" href="https://projects.eclipse.org/projects/technology.simrel"><i class='fa fa-cube'></i> SimRel Project</a>
<a href="${scriptBase}?file=wiki/Simultaneous_Release.md">Schedule</a>
<a id="current-release-cycle" href="">&nbsp;&nbsp;&bullet;&nbsp;${currentReleaseCycle}</a>
<a id="current-release-cycle-participants" href="">&nbsp;&nbsp;&nbsp;&nbsp;&bullet;&nbsp;Participants</a>
<a href="${scriptBase}?file=wiki/SimRel/Overview.md">Overview</a>
<a href="${scriptBase}?file=wiki/SimRel/Simultaneous_Release_Requirements.md">Requirements</a>
<a href="${scriptBase}?file=report/report.md">Contributor Report</a>
<a href="${scriptBase}?file=wiki/SimRel/Simultaneous_Release_Cycle_FAQ.md">FAQ</a>
`;

let githubAside = `
<a class="separator" href="https://github.com/eclipse-simrel"><i class='fa fa fa-github'></i> GitHub</a>
<a href="https://github.com/eclipse-simrel/simrel.build">Build</a>
<a href="https://github.com/eclipse-simrel/.github">Wiki</a>
`;

let cbiAsideProjects = `
<a href="${scriptBase}cbi/?file=eclipse-cbi/p2repo-sbom/main/docs/index.md">p2 SBOM</a>
<a href="${scriptBase}cbi/?file=eclipse-cbi/p2repo-aggregator/main/docs/user-guide.md">p2 Aggregator</a>
<a href="${scriptBase}cbi/?file=eclipse-cbi/p2repo-analyzers/main/README.md">p2 Analyzers</a>
`;

let cbiAside = `
<a class="separator" href="/simrel/cbi/"><i class='fa fa-cube'></i> CBI</a>
${cbiAsideProjects}
`;

let defaultAside = toElements(`
${projectAside}
${repo == '.github' && path == 'profile/README.md' ? githubAside : ''}
${repo == '.github' && path == 'profile/README.md' ? cbiAside : ''}
`);

let tableOfContentsAside = `
<div id="toc" class="col-md-6">
	<aside>
		<ul class="ul-left-nav">
			<div  class="sideitem">
				<h2>Table of Contents</h2>
				<div id="toc-target">
				</div>
			</div>
		</ul>
	</aside>
</div>`;

function generate() {
	try {
		const head = document.head;
		var referenceNode = head.querySelector('script');
		for (const element of [...meta]) {
			head.insertBefore(element, referenceNode.nextElementSibling)
			referenceNode = element;
		}

		const generators = document.querySelectorAll('[data-generate]');
		for (const element of generators) {
			const generator = element.getAttribute('data-generate');
			const generate = new Function(generator);
			generate.call(element, element);
		}

		const generatedBody = generateBody();
		document.body.replaceChildren(...generatedBody);
		generateBreadcrumbDetails(path.replace(/\/$/, ''));

		if (!selfHosted && isLocalHost) {
			const localURL = new URL(window.location);
			localURL.hash = '';
			localURL.search = '';
			localURL.pathname = `${org}/${repo}/${branch}/${path}`;
			fetch(localURL, { method: 'HEAD', cache: "no-store" }).then(response => {
				if (response.status == 200 && response.headers.get('Server') == 'org.eclipse.oomph.internal.util.HTTPServer') {
					defaultHandler(localURL);
				} else {
					defaultHandler(defaultURL);
				}
			});
		} else {
			defaultHandler(defaultURL);
		}
	} catch (exception) {
		document.body.prepend(...toElements(`<span>Failed to generate content: <span><b style="color: FireBrick">${exception.message}</b><br/>`));
		console.log(exception);
	}
}

function generateDefaults(element) {
	const parts = [];
	if (!hasElement('header')) {
		parts.push(generateDefaultHeader(document.createElement('div')));
	}
	if (!hasElement('breadcrumb')) {
		parts.push(generateDefaultBreadcrumb(document.createElement('div')));
	}
	if (!hasElement('aside')) {
		parts.push(generateDefaultAside(document.createElement('div')));
	}
	if (!hasElement('nav')) {
		parts.push(generateDefaultNav(document.createElement('div')));
	}
	element.prepend(...parts);
}

function generateBody() {
	const col = document.getElementById('aside') ? 'col-md-18' : ' col-md-24';
	return toElements(`
<div>
	${generateHeader()}
	<main id="content">
		<div class="novaContent container" id="novaContent">
			<div class="row">
				<div class="${col} main-col-content">
					<div class="novaContent" id="novaContent">
						<div class="row">
							${generateBreadcrumb()}
						</div>
						<div class=" main-col-content">
							${generateNav()}
							<div id="midcolumn">
							${generateMainContent()}
							</div>
						</div>
					</div>
				</div>
				${generateAside()}
				${tableOfContentsAside}
			</div>
		</div>
	</main>
	<footer id="footer">
		<div class="container">
			<div class="footer-sections row equal-height-md font-bold">
				<div id="footer-eclipse-foundation" class="footer-section col-md-5 col-sm-8">
					<div class="menu-heading">Eclipse Foundation</div>
					<ul class="nav">
						<ul class="nav">
							<li><a href="http://www.eclipse.org/org/">About</a></li>
							<li><a href="https://projects.eclipse.org/">Projects</a></li>
							<li><a href="http://www.eclipse.org/collaborations/">Collaborations</a></li>
							<li><a href="http://www.eclipse.org/membership/">Membership</a></li>
							<li><a href="http://www.eclipse.org/sponsor/">Sponsor</a></li>
						</ul>
					</ul>
				</div>
				<div id="footer-legal" class="footer-section col-md-5 col-sm-8">
					<div class="menu-heading">Legal</div>
					<ul class="nav">
						<ul class="nav">
							<li><a href="http://www.eclipse.org/legal/privacy.php">Privacy Policy</a></li>
							<li><a href="http://www.eclipse.org/legal/termsofuse.php">Terms of Use</a></li>
							<li><a href="http://www.eclipse.org/legal/compliance/">Compliance</a></li>
							<li><a href="http://www.eclipse.org/org/documents/Community_Code_of_Conduct.php">Code of
									Conduct</a></li>
							<li><a href="http://www.eclipse.org/legal/">Legal Resources</a></li>
						</ul>
					</ul>
				</div>
				<div id="footer-more" class="footer-section col-md-5 col-sm-8">
					<div class="menu-heading">More</div>
					<ul class="nav">
						<ul class="nav">
							<li><a href="http://www.eclipse.org/security/">Report a Vulnerability</a></li>
							<li><a href="https://www.eclipsestatus.io/">Service Status</a></li>
							<li><a href="http://www.eclipse.org/org/foundation/contact.php">Contact</a></li>
							<li><a href="http://www.eclipse.org//projects/support/">Support</a></li>
						</ul>
					</ul>
				</div>
			</div>
			<div class="col-sm-24">
				<div class="row">
					<div id="copyright" class="col-md-16">
						<p id="copyright-text">Copyright © Eclipse Foundation AISBL. All Rights Reserved.</p>
					</div>
				</div>
			</div>
			<a href="#" class="scrollup" onclick="scrollToTop()">Back to the top</a>
		</div>
	</footer>
</div>
`);
}

function generateMainContent() {
	const main = document.body.querySelector('main')
	if (main != null) {
		return main.outerHTML
	}
	return `
<main>The body specifies no content.</main>
`;
}

function generateDefaultHeader(element) {
	return prependChildren(element, 'header', ...defaultHeader);
}

function generateHeader() {
	const elements = document.querySelectorAll('#header>a');
	const items = Array.from(elements).map(link => {
		link.classList.add('link-unstyled');
		return `
<li class="navbar-nav-links-item">
	${link.outerHTML}
</li>
`;
	});
	const mobileItems = Array.from(elements).map(link => {
		link.className = 'mobile-menu-item mobile-menu-dropdown-toggle';
		return `
<li class="mobile-menu-dropdown">
	${link.outerHTML}
</li>
`;
	});

	return `
<header class="header-wrapper" id="header">
	<div class="header-navbar-wrapper">
		<div class="container">
			<div class="header-navbar">
				<a class="header-navbar-brand" href="https://eclipseide.org/">
					<div class="logo-wrapper">
						<img src="https://eclipse.dev/eclipse.org-common/themes/solstice/public/images/logo/eclipse-ide/eclipse_logo.svg" alt="Eclipse Project" width="150"/>
					</div>
				</a>
				<nav class="header-navbar-nav">
					<ul class="header-navbar-nav-links">
						${items.join('\n')}
					</ul>
				</nav>
				<div class="header-navbar-end">
					<div class="float-right hidden-xs" id="btn-call-for-action">
						<a href="https://www.eclipse.org/sponsor/ide/" class="btn btn-huge btn-warning">
							<i class="fa fa-star"></i> Sponsor
						</a>
					</div>
					<button class="mobile-menu-btn" onclick="toggleMenu()">
						<i class="fa fa-bars fa-xl"/></i>
					</button>
				</div>
			</div>
		</div>
	</div>
	<nav id="mobile-menu" class="mobile-menu hidden" aria-expanded="false">
		<ul>
			${mobileItems.join('\n')}
		</ul>
	</nav>
</header>
`;
}

function generateDefaultBreadcrumb(element) {
	return prependChildren(element, 'breadcrumb', ...defaultBreadcrumb);
}

function generateBreadcrumb() {
	const breadcumbs = document.getElementById('breadcrumb')
	if (breadcumbs == null) {
		return '';
	}

	const elements = breadcumbs.children;
	const items = Array.from(elements).map(link => `<li>${link.outerHTML}</li>`);

	const extraBreachcrumb = generateExtraBreadcrumb();
	if (extraBreachcrumb != null) {
		items.push(`<li>${extraBreachcrumb}</li>`);
	}

	return `
<section class="default-breadcrumbs hidden-print breadcrumbs-default-margin"
	id="breadcrumb">
	<div class="container">
		<h3 class="sr-only">Breadcrumbs</h3>
		<div class="row">
			<div class="col-sm-24">
				<ol class="breadcrumb">
					${items.join('\n')}
				</ol>
			</div>
		</div>
	</div>
</section>
`;
}

function generateExtraBreadcrumb() {
	const file = getQueryParameter('file');
	if (file != null) {
		const match = file.match(/[^\/]+/g);
		if (match.length == 1) {
			return `<span>${niceName(match[0])}</span>`;
		}
	}
}

function niceName(name) {
	return name.replaceAll(/\.md$/g, '').replaceAll(/[_-]/g, ' ').replaceAll(/([a-z])([A-Z])/g, '$1 $2').replace(/^([a-z])/, letter => letter.toLocaleUpperCase())
}

function generateDefaultNav(element) {
	return prependChildren(element, 'nav', ...defaultNav);
}

let navImage = `${scriptBase}images/simrel-logo-with-title.svg`;

let navLink = `${scriptBase}`;

function generateNav() {
	const elements = document.body.querySelectorAll('#nav>a');
	if (elements.length == 0) {
		return '';
	}

	const items = Array.from(elements).map(element => {
		const href = element.getAttribute('href')
		const target = element.getAttribute('target') ?? "_self";
		const title = element.getAttribute('title') ?? '';
		const className = element.className ?? '';
		const content = element.innerHTML;
		return `
<li class="col-xs-24 col-md-12">
	<a class="row" href="${href}" title="${title}"
		target="${target}">
		<i class="col-xs-3 col-md-6 fa ${className}"></i>
		<span class="col-xs-21 c col-md-17">${content}
		</span>
	</a>
</li>
`;
	});

	return `
<div class="header_nav">
	<div class="col-xs-24 col-md-10 vcenter">
		<a href="${navLink}">
			<img id="header-nav-img" src="${navImage}" alt="The Main Index Page" width="50%" xheight="auto" class="img-responsive header_nav_logo"/>
		</a>
	</div><!-- NO SPACES
 --><div class="col-xs-24 col-md-14 vcenter">
		<ul class="clearfix">
			${items.join('\n')}
		</ul>
	</div>
</div>
`;
}

function generateDefaultAside(element) {
	return prependChildren(element, 'aside', ...defaultAside);
}

function generateAside() {
	const elements = document.body.querySelectorAll('aside>*,#aside>*');
	if (elements.length == 0) {
		return '';
	}

	const items = Array.from(elements).map(element => {
		const main = element.classList.contains('separator')
		element.classList.add('link-unstyled');
		if (main) {
			element.classList.add('main-sidebar-heading');
			return `
<li class="main-sidebar-main-item main-sidebar-item-indented separator">
	${element.outerHTML}
</li>
`
		} else {
			return `
<li class="main-sidebar-item main-sidebar-item-indented">
	${element.outerHTML}
</li>
`
		}
	});

	return `
<div class="col-md-6 main-col-sidebar-nav">
	<aside class="main-sidebar-default-margin" id="main-sidebar">
		<ul class="ul-left-nav" id="leftnav" role="tablist" aria-multiselectable="true">
			${items.join('\n')}
	</aside>
</div>
`;
}

function getFileParameter() {
	const search = new URLSearchParams(window.location.search);
	return search.get('file') ?? ((typeof defaultMarkdown === 'undefined') ? 'profile/README.md' : defaultMarkdown);
}

function getMarkdownSearch(path) {
	const dotGitHubParts = /eclipse-simrel\/.github\/main\/(?<path>.*)/.exec(path);
	if (dotGitHubParts != null) {
		return `?file=${dotGitHubParts.groups.path}`;
	}
	return `?file=${path}`;
}

function getTargetElement() {
	return document.getElementById('markdown-target');
}

function fixHash(hash) {
	return hash.toLowerCase();
}

function toSiteURL(url) {
	if (url.hostname == 'api.github.com' && url.pathname.startsWith('/repos/eclipse-simrel/simrel-website/contents')) {
		const result = new URL(window.location);
		result.pathname = url.pathname.replace(/\/repos\/eclipse-simrel\/simrel-website\/contents/, '/simrel')
		result.hash = url.hash;
		result.search = url.search;
		return result;
	} else {
		return null;
	}
}

function generateBreadcrumbDetails(path) {
	const breadcrumb = document.querySelector(".breadcrumb");
	if (org == "eclipse-packaging") {
		document.title = `SimRel | Eclipse Packaging`;
		breadcrumb.append(...toElements(`<li>Eclipse Packaging</li>`));
		const headerNavImg = document.getElementById('header-nav-img');
		if (headerNavImg != null) {
			headerNavImg.src = 'https://raw.githubusercontent.com/eclipse-packaging/.github/refs/heads/main/assets/artwork/svg/EPP-Color-Vertical.svg';
		}
	} else if (path.startsWith('report/report.md')) {
		document.title = `SimRel | Contributors`;
		breadcrumb.append(...toElements(`<li>Contributors</li>`));
	} else if (path.startsWith('wiki/Simultaneous_Release.md')) {
		document.title = `SimRel | Schedule`;
		breadcrumb.append(...toElements(`<li>Schedule</li>`));
	} else {
		const matchRelease = /^wiki\/SimRel\/(?<name>[0-9-]+).md$/.exec(path);
		if (matchRelease != null) {
			const name = matchRelease.groups.name;
			breadcrumb.append(...toElements(`<li><a href="${scriptBase}?file=wiki/Simultaneous_Release.md">Schedule</a></li> <li>${name}</li>`));
			document.title = `SimRel | ${name}`;
			generateParticipants(name);
		} else {
			const matchBasic = /^wiki\/SimRel\/(?<qualifier>Simultaneous_Release_Cycle_|Simultaneous_Release_|Contributing_to_Simrel_Aggregation_Build|Release_|)(?<name>.*).md$/.exec(path);
			if (matchBasic != null) {
				const name = niceName(matchBasic.groups.name);
				const fixedName = name == '' ? 'Contibution' : name;
				breadcrumb.append(...toElements(`<li>${fixedName}</li>`));
				document.title = `SimRel | ${fixedName}`;
			} else {
				const participantMatch = /^wiki\/SimRel\/(?<name>.*)_participants.json$/.exec(path);
				if (participantMatch != null) {
					const name = participantMatch.groups.name;
					document.title = `SimRel | ${name} Participants`;
					breadcrumb.append(...toElements(`<li><a href="${scriptBase}?file=wiki/Simultaneous_Release.md">Schedule</a></li> <li><a href="${scriptBase}?file=wiki/SimRel/${name}.md">${name}</a></li> <li>Participants</li>`));
				}
			}
		}
	}
}

function generateParticipants(name) {
	handleDocument('eclipse-simrel', '.github', 'main', `wiki/SimRel/${name}_participants.json`, content => {
		if (!content.includes('"status":')) {
			const element = document.getElementById('common-information');
			if (element != null) {
				const li = element.nextElementSibling.firstElementChild
				li.parentNode.insertBefore(...toElements(`<li><a href="${scriptBase}?file=wiki/SimRel/${name}_participants.json">${name} partipating projects.</a></li>`), li);
			}
		}
	});
}

function generateFileList(files) {
	const fileElements = files.map(file => {
		const fileURL = new URL(file.url);
		const fileName = fileURL.pathname.endsWith('/profile') || fileURL.pathname.endsWith('/') || isLocalHost && file['type'] == 'dir' ?
			/(?<filename>[^./][^/]+)\/?$/.exec(fileURL.pathname) :
			/(?<filename>[^/]+)\.(md|json)$/.exec(fileURL.pathname);
		if (fileName == null) {
			return '';
		}
		const branch = fileURL.searchParams.get('ref');
		const parts = /\/repos\/(?<org>[^/]+)\/(?<repo>[^/]+)\/contents\/(?<path>.*)/.exec(fileURL.pathname);
		const url = new URL(window.location);
		url.hash = '';
		url.search = getMarkdownSearch(`${parts.groups.org}/${parts.groups.repo}/${branch}/${parts.groups.path}`.replace('//', '/'));
		const label = niceName(fileName.groups.filename);
		return `<div><a href="${url}">${label}<a/></div>\n`;
	});

	const folder = path.replace(/\/$/, '');
	const heading = `<h2>Contents of ${org}/${repo}${folder.length == 0 ? '' : ` - ${folder}`}</h2>\n`;

	getTargetElement().innerHTML = heading + fileElements.join('');
}

function generateReleaseParticipants(logicalBaseURL, response) {
	const json = JSON.parse(response);
	const release = Object.keys(json);
	const projects = json[release].projects;
	const projectList = Object.entries(projects).map(([key, value]) => {
		const project_name = value.project_name;
		const new_and_noteworthy_url = value.new_and_noteworthy_url;
		const news = new_and_noteworthy_url == null ? '' : ` [**&#128240;**](${new_and_noteworthy_url})`;
		return `1. [${project_name}](https://projects.eclipse.org/projects/${key})${news}`;
	}).join('\n');
	generateMarkdown(logicalBaseURL, `
# [${release}](${release}.md)

${projectList}

# [${release} JSON](${release}_participants.json)

<details>
<summary>${release}_participants.json</summary>

${"```"}
${response}
${"```"}
</details>
`)
	const projectReferences = document.getElementById('markdown-target').querySelectorAll('a[href^="https://projects.eclipse.org/projects/"]');
	for (const project of projectReferences) {
		const projectId = project.href.toString().replace(/.*\//, '');
		handleDocumentURL(new URL(`https://projects.eclipse.org/api/projects/${projectId.replace('.', '_')}`), content => {
			const json = JSON.parse(content);
			const projectJSON = json[0];
			let projectLogo = 'https://projects.eclipse.org/modules/custom/eclipsefdn/eclipsefdn_projects/images/logos/default.png';
			if (projectJSON != null) {
				const logo = projectJSON.logo;
				if (logo != null) {
					projectLogo = logo;
				}
			}
			project.parentElement.insertBefore(...toElements(`<span><img class="zoom" src="${projectLogo}"/>&nbsp;</span>`), project);
		});
	}
}

function generateMarkdown(logicalBaseURL, response) {
	if (response instanceof Array) {
		generateFileList(response);
	} else if (response.startsWith('{')) {
		if (logicalBaseURL.toString().endsWith("_participants.json")) {
			generateReleaseParticipants(logicalBaseURL, response);
		} else {
			generateMarkdown(logicalBaseURL, `
${"```"}
${response}
${"```"}
`);
		}
	} else {
		const text = response;
		const editLink = logicalBaseURL.toString().includes('report.md') ? '' : `<a id="edit-markdown-link" href=""><span class="orange">\u270E Improve this page</span></a>\n`;
		marked.use(markedGfmHeadingId.gfmHeadingId());
		marked.use({
			hooks: {
				postprocess(html) {
					return `${html}`;
				}
			}
		});
		getTargetElement().innerHTML = editLink + marked.parse(text);

		const headings = markedGfmHeadingId.getHeadingList();
		const headingText = `
<ul id="table-of-contents">
${headings.map(({ id, raw, level }) => `<li class="tl${level}"><a href="#${id}">${raw}</a></li>`).join(' ')}
</ul>
`;
		console.log("Foo");
		document.getElementById('toc-target').replaceChildren(...toElements(headingText));

		const logo = getTargetElement().querySelector('img[src$="SimRel-Color.svg"]');
		if (logo != null) {
			const next = logo.nextElementSibling
			logo.remove();
			if (next != null) {
				next.remove();
			}
		}

		const imgs = getTargetElement().querySelectorAll("img[src]");
		for (const img of imgs) {
			const src = img.getAttribute('src');
			if (src == null) {
				continue;
			}

			if (!src.startsWith('http')) {
				const logicalSrc = new URL(src, logicalBaseURL);
				const siteURL = toSiteURL(logicalSrc);
				if (siteURL != null) {
					img.src = siteURL;
				} else {
					img.src = new URL(`https://raw.githubusercontent.com/${org}/${repo}/${branch}/${path}/../${src}`);
				}
			}
		}

		const as = getTargetElement().querySelectorAll("a[href]");
		for (const a of as) {
			const href = a.getAttribute('href');
			if (href == null || href == '') {
				continue;
			}

			if (href.startsWith('#')) {
				a.setAttribute('href', fixHash(href));
				continue;
			}

			const logicalHref = new URL(href, logicalBaseURL);
			if (logicalHref.pathname.endsWith('report.svg')) {
				a.href = 'report/report.svg';
				continue;
			} else if (!logicalHref.pathname.endsWith('.md')) {
				if (!href.startsWith('http')) {
					a.href = new URL(`https://github.com/${org}/${repo}/blob/${branch}/${path}/../${href}`);
				}
				continue;
			}

			const url = new URL(window.location);
			url.hash = fixHash(logicalHref.hash);
			if (logicalHref.hostname == 'api.github.com') {
				const parts = /\/repos\/(?<org>[^/]+)\/(?<repo>[^/]+)\/contents\/(?<path>.*)/.exec(logicalHref.pathname);
				if (parts != null) {
					if (parts.groups.org == 'eclipse-simrel' || parts.groups.org == 'eclipse-packaging' || parts.groups.org == 'eclipse-cbi') {
						url.search = getMarkdownSearch(`${parts.groups.org}/${parts.groups.repo}/${branch}/${parts.groups.path}`);
						a.href = url;
					}
				}
			} else if (logicalHref.hostname == 'github.com') {
				const parts = /(?<org>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<branch>[^/]+)\/(?<path>.*)/.exec(logicalHref.pathname);
				if (parts != null) {
					if (parts.groups.org == 'eclipse-simrel' || parts.groups.org == 'eclipse-packaging' || parts.groups.org == 'eclipse-cbi') {
						url.search = getMarkdownSearch(`${parts.groups.org}/${parts.groups.repo}/${parts.groups.branch}/${parts.groups.path}`);
						a.href = url;
					}
				}
			}
		}

		const editMarkdownLink = document.getElementById('edit-markdown-link');
		if (editMarkdownLink != null) {
			editMarkdownLink.href = `https://github.com/${org}/${repo}/blob/${branch}/${path}`;
		}

		// Ensure that we nagivate to the target.
		if (document.location.hash.includes('#')) {
			document.location.hash = document.location.hash;
		}

		updateTocSize();
	}
}

function defaultHandler(url) {
	fetch(url).then(response => {
		return response.text();
	}).then(text => {
		if (text.startsWith('<') && !url.toString().endsWith('.md')) {
			if (text.startsWith('<img') || text.match(/<ul><li><a href="[^"]+"> Parent Directory<\/a><\/li>/)) {
				const links = [...text.matchAll(/href="([^./][^"]+?(\.md|\/))"/g).map(match => {
					return { url: `https://api.github.com/repos/${org}/${repo}/contents/${path}/${match[1]}?ref=${branch}` };
				})];
				generateFileList(links);
			} else if (url != apiURL) {
				getTargetElement().innerHTML = `Cannot produce directory listing ${url} redirecting to ${apiURL}.`;
				defaultHandler(apiURL);
			} else {
				getTargetElement().innerHTML = `Cannot produce directory listing ${url}.`;
			}
		} else if (text.startsWith('{') || text.startsWith('[')) {
			if (url.toString().endsWith('.json')) {
				generateMarkdown(logicalBaseURL, text);
			} else {
				const json = JSON.parse(text);
				generateMarkdown(logicalBaseURL, json instanceof Array ? json : blobToText(json.content));
			}
		} else {
			generateMarkdown(logicalBaseURL, text);
		}
	});
}

function updateTocSize() {
	const toc = document.getElementById('toc');
	const tocInner = document.getElementById('table-of-contents');
	if (toc != null && tocInner != null) {
		const height = window.document.documentElement.clientHeight;
		tocInner.style.maxHeight = `${height - tocInner.getBoundingClientRect().top - 20}px`;
		toc.style.maxHeight = `${height - toc.getBoundingClientRect().top - 20}px`;
	}
}


function getCurrentReleaseCycle() {
	handleDocument('eclipse-simrel', 'simrel.build', 'main', 'simrel.aggr', content => {
		const match = /label="(?<label>[^"]+)"/.exec(content);
		if (match != null) {
			const currentReleaseCycleElement = document.getElementById('current-release-cycle');
			if (currentReleaseCycleElement != null) {
				currentReleaseCycleElement.innerHTML = currentReleaseCycleElement.innerHTML.replace(/[0-9-]+/, match.groups.label);
				currentReleaseCycleElement.href = `${scriptBase}?file=wiki/SimRel/${match.groups.label}.md`;
			}
			const currentReleaseCycleParticipantsElement = document.getElementById('current-release-cycle-participants');
			if (currentReleaseCycleParticipantsElement != null) {
				currentReleaseCycleParticipantsElement.innerHTML = currentReleaseCycleParticipantsElement.innerHTML.replace(/[0-9-]+/, match.groups.label);
				currentReleaseCycleParticipantsElement.href = `${scriptBase}?file=wiki/SimRel/${match.groups.label}_participants.json`;
			}
		}
	});

	// Try to get it roughly correct; it will be corrected when the document is loaded.
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDay();
	const quarter = (((month - 1) * 30 + day + 19) / 91) + 1;
	const suffix = quarter < 2 ? "03" : quarter < 3 ? "06" : quarter < 4 ? "09" : "12";
	const currentRelease = quarter > 4.99 ? `${year + 1}-03` : `${year}-${suffix}`
	return `${currentRelease}`;
}

function handleDocument(org, repo, branch, path, handler) {
	const url = new URL(`https://api.github.com/repos/${org}/${repo}/contents/${path}?ref=${branch}`);
	if (isLocalHost) {
		const localURL = new URL(window.location);
		localURL.hash = '';
		localURL.search = '';
		localURL.pathname = `${org}/${repo}/${branch}/${path}`;
		fetch(localURL, { method: 'HEAD', cache: "no-store" }).then(response => {
			if (response.status == 200 && response.headers.get('Server') == 'org.eclipse.oomph.internal.util.HTTPServer') {
				handleDocumentURL(localURL, handler);
			} else {
				handleDocumentURL(url, handler);
			}
		});
	} else {
		handleDocumentURL(url, handler);
	}
}

function handleDocumentURL(url, handler) {
	fetch(url).then(response => {
		return response.text();
	}).then(text => {
		const host = url.hostname;
		let content = text;
		if (host != 'localhost') {
			const json = JSON.parse(text);
			if (json.content) {
				content = blobToText(json.content);
			}
		}
		handler(content);
	});
}

function blobToText(blob) {
	const binary = window.atob(blob);
	const bytes = new Uint8Array(binary.length);
	for (var i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const decoder = new TextDecoder();
	const realText = decoder.decode(bytes);
	return realText;
}


function hasElement(id) {
	return document.getElementById(id) != null;
}

function toElements(text) {
	const wrapper = document.createElement('div');
	wrapper.innerHTML = text;
	return wrapper.children
}

function replaceChildren(element, id, ...children) {
	element.id = id;
	element.replaceChildren(...children);
	return element;
}

function prependChildren(element, id, ...children) {
	element.id = id;
	element.prepend(...children);
	return element;
}

function addBase(htmlDocument, location) {
	const base = htmlDocument.createElement('base');
	base.href = location;
	htmlDocument.head.appendChild(base);
}

function getQueryParameter(id) {
	const location = new URL(window.location);
	const search = new URLSearchParams(location.search);
	return search.get(id);
}

function toggleMenu() {
	const mobileMenu = document.getElementById('mobile-menu')
	if (mobileMenu.classList.contains('hidden')) {
		mobileMenu.classList.remove('hidden');
	} else {
		mobileMenu.classList.add('hidden');
	}
}

function scrollToTop() {
	window.scrollTo({ top: 0, behavior: 'smooth' });
}
