window.GithubService = {
  async fetchProfile(username) {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) {
      throw new Error('GitHub user not found');
    }
    return response.json();
  },

  async fetchRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) {
      throw new Error('Unable to fetch repositories');
    }
    return response.json();
  },
};
