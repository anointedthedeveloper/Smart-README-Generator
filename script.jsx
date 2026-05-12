const { useEffect, useMemo, useState } = React;
const ReactMarkdown = window.ReactMarkdown;
const remarkGfm = window.remarkGfm;

const LICENSE_OPTIONS = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'ISC',
  'Unlicense',
  'None',
];

const TEMPLATES = {
  minimal: 'Minimal',
  advanced: 'Advanced',
};

const defaultFormState = {
  projectName: '',
  description: '',
  features: '',
  installation: '',
  usage: '',
  license: 'MIT',
  githubUsername: '',
  email: '',
  contributing: false,
  credits: false,
  faq: false,
  template: 'advanced',
};

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }, [key, value]);

  return [value, setValue];
}

function buildMarkdown(data, githubData) {
  const features = data.features
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join('\n');

  const repoLines = githubData.topRepos.length
    ? githubData.topRepos.map((repo) => `- [${repo.name}](${repo.html_url}) • ★ ${repo.stargazers_count} • ${repo.description || 'No description'}`)
    : ['- Add your top projects here.'];

  const contributingSection = data.contributing
    ? `## Contributing
${data.contributingText || 'Contributions are welcome. Please open an issue or pull request.'}

`
    : '';
  const creditsSection = data.credits
    ? `## Credits
${data.creditsText || 'This project was created with inspiration from open source tools and the developer community.'}

`
    : '';
  const faqSection = data.faq
    ? `## FAQ
${data.faqText || 'Q: Why this tool?\nA: To make README creation fast and easy.'}

`
    : '';

  const licenseBadge = data.license !== 'None'
    ? `![License](https://img.shields.io/badge/license-${encodeURIComponent(data.license)}-blue.svg)`
    : '';

  const githubStatsBadge = githubData.profile
    ? `![GitHub followers](https://img.shields.io/badge/followers-${githubData.profile.followers}-blue.svg) ![Repos](https://img.shields.io/badge/repos-${githubData.profile.public_repos}-green.svg)`
    : '';

  const githubProfileSection = githubData.profile
    ? `## GitHub Profile
![Avatar](${githubData.profile.avatar_url}&s=120)

**[${githubData.profile.login}](${githubData.profile.html_url})**  
${githubData.profile.name || ''}

${githubData.profile.bio || 'No bio available.'}

- Repositories: ${githubData.profile.public_repos}
- Followers: ${githubData.profile.followers}
- Following: ${githubData.profile.following}
- Location: ${githubData.profile.location || 'N/A'}

`
    : '';

  return `# ${data.projectName || 'Project Title'}

${licenseBadge}${licenseBadge && githubStatsBadge ? '  \n' : ''}${githubStatsBadge}

## Description
${data.description || 'Describe your project in a few sentences.'}

## Features
${features || '- Add project features here.'}

## Installation
${data.installation || 'Describe the installation steps here.'}

## Usage
${data.usage || 'Explain how to use the application.'}

${contributingSection}${creditsSection}${faqSection}## Top Projects
${repoLines.join('\n')}

${githubProfileSection}## Contact
- GitHub: ${data.githubUsername ? `https://github.com/${data.githubUsername}` : 'https://github.com/your-username'}
- Email: ${data.email || 'N/A'}
`;
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="theme-switcher" aria-label="Theme toggle">
      <span>Theme</span>
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
      >
        Light
      </button>
      <button
        type="button"
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
      <button
        type="button"
        className={theme === 'system' ? 'active' : ''}
        onClick={() => setTheme('system')}
      >
        System
      </button>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} role="status">
      {toast.message}
    </div>
  );
}

function GithubProfileCard({ profile, topRepos }) {
  if (!profile) return null;
  return (
    <div className="profile-card">
      <div className="row">
        <img src={profile.avatar_url} alt={`${profile.login} avatar`} />
        <div className="meta">
          <strong>{profile.name || profile.login}</strong>
          <span>{profile.bio || 'No bio available'}</span>
          <span className="muted">{profile.html_url}</span>
        </div>
      </div>
      <div className="profile-grid">
        <div className="stat">
          <strong>Repos</strong>
          {profile.public_repos}
        </div>
        <div className="stat">
          <strong>Followers</strong>
          {profile.followers}
        </div>
        <div className="stat">
          <strong>Following</strong>
          {profile.following}
        </div>
        <div className="stat">
          <strong>Top repo</strong>
          {topRepos[0] ? topRepos[0].name : 'N/A'}
        </div>
      </div>
    </div>
  );
}

function Preview({ markdown }) {
  return (
    <div className="preview-panel">
      <div className="preview-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

function App() {
  const [formData, setFormData] = useState(defaultFormState);
  const [theme, setTheme] = useLocalStorage('readme-generator-theme', 'system');
  const [toast, setToast] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [githubData, setGithubData] = useState({ profile: null, topRepos: [] });
  const [githubError, setGithubError] = useState('');

  useEffect(() => {
    const root = document.body;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    root.classList.toggle('light', resolvedTheme === 'light');
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!formData.githubUsername.trim()) {
      setGithubData({ profile: null, topRepos: [] });
      setGithubError('');
      return;
    }

    const controller = new AbortController();
    const username = formData.githubUsername.trim();
    const delay = setTimeout(async () => {
      setIsFetching(true);
      setGithubError('');
      try {
        const profile = await window.GithubService.fetchProfile(username);
        const repos = await window.GithubService.fetchRepos(username);
        const sortedRepos = repos.slice().sort((a, b) => b.stargazers_count - a.stargazers_count);
        const topRepos = sortedRepos.slice(0, 5);
        setGithubData({ profile, topRepos });
      } catch (error) {
        setGithubData({ profile: null, topRepos: [] });
        setGithubError(error.message || 'Unable to load GitHub data');
        setToast({ type: 'error', message: error.message || 'GitHub fetch failed' });
      } finally {
        setIsFetching(false);
      }
    }, 600);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [formData.githubUsername]);

  const markdown = useMemo(() => buildMarkdown(formData, githubData), [formData, githubData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = () => {
    setToast({ type: 'success', message: 'README content refreshed.' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setToast({ type: 'success', message: 'Markdown copied to clipboard.' });
    } catch {
      setToast({ type: 'error', message: 'Copy failed. Please try again.' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ type: 'success', message: 'README.md download started.' });
  };

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Smart README Generator</h1>
          <p>
            Build professional README files fast. Auto-fill GitHub profile details, preview Markdown live,
            and export polished documentation with one click.
          </p>
        </div>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="grid">
        <section className="panel">
          <h2>Project Details</h2>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="Smart README Generator"
              />
            </div>

            <div className="field-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what your project does and why it exists."
              />
            </div>

            <div className="field-group">
              <label htmlFor="features">Features</label>
              <textarea
                id="features"
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="One feature per line"
              />
            </div>

            <div className="field-group">
              <label htmlFor="installation">Installation</label>
              <textarea
                id="installation"
                value={formData.installation}
                onChange={(e) => handleInputChange('installation', e.target.value)}
                placeholder="npm install / yarn install / etc."
              />
            </div>

            <div className="field-group">
              <label htmlFor="usage">Usage</label>
              <textarea
                id="usage"
                value={formData.usage}
                onChange={(e) => handleInputChange('usage', e.target.value)}
                placeholder="Explain how the user runs and interacts with the project."
              />
            </div>

            <div className="field-group">
              <label htmlFor="license">License</label>
              <select
                id="license"
                value={formData.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
              >
                {LICENSE_OPTIONS.map((license) => (
                  <option key={license} value={license}>
                    {license}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="githubUsername">GitHub Username</label>
              <input
                id="githubUsername"
                value={formData.githubUsername}
                onChange={(e) => handleInputChange('githubUsername', e.target.value)}
                placeholder="github username"
              />
            </div>

            <div className="field-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="toggle-group">
              <div className="toggle-row">
                <span>Contributing section</span>
                <input
                  type="checkbox"
                  checked={formData.contributing}
                  onChange={() => handleCheckbox('contributing')}
                />
              </div>
              <div className="toggle-row">
                <span>Credits section</span>
                <input
                  type="checkbox"
                  checked={formData.credits}
                  onChange={() => handleCheckbox('credits')}
                />
              </div>
              <div className="toggle-row">
                <span>FAQ section</span>
                <input
                  type="checkbox"
                  checked={formData.faq}
                  onChange={() => handleCheckbox('faq')}
                />
              </div>
            </div>

            {formData.contributing && (
              <div className="field-group">
                <label htmlFor="contributingText">Contributing Notes</label>
                <textarea
                  id="contributingText"
                  value={formData.contributingText || ''}
                  onChange={(e) => handleInputChange('contributingText', e.target.value)}
                  placeholder="Add contribution guidelines or a link to your contributing guide."
                />
              </div>
            )}

            {formData.credits && (
              <div className="field-group">
                <label htmlFor="creditsText">Credits</label>
                <textarea
                  id="creditsText"
                  value={formData.creditsText || ''}
                  onChange={(e) => handleInputChange('creditsText', e.target.value)}
                  placeholder="Mention libraries, designers, or collaborators."
                />
              </div>
            )}

            {formData.faq && (
              <div className="field-group">
                <label htmlFor="faqText">FAQ</label>
                <textarea
                  id="faqText"
                  value={formData.faqText || ''}
                  onChange={(e) => handleInputChange('faqText', e.target.value)}
                  placeholder="Add a common question and answer about the project."
                />
              </div>
            )}
          </div>

          <div className="button-row">
            <button className="primary" type="button" onClick={handleGenerate}>
              Generate README
            </button>
            <button className="secondary" type="button" onClick={handleCopy}>
              Copy to Clipboard
            </button>
            <button className="secondary" type="button" onClick={handleDownload}>
              Download README.md
            </button>
          </div>

          <div className="github-card">
            <strong>GitHub Fetch</strong>
            <p>{isFetching ? 'Loading GitHub profile…' : githubError || 'Profile data is loaded automatically when username is entered.'}</p>
            {githubData.profile && <GithubProfileCard profile={githubData.profile} topRepos={githubData.topRepos} />}
          </div>
        </section>

        <section className="panel">
          <h2>Live Preview</h2>
          <Preview markdown={markdown} />
        </section>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
