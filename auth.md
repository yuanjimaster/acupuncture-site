# auth.md

> Authentication and agent registration information for acupuncturistusa.com

## Status

This site is **fully public**. No authentication is required to access any content or endpoints.

## Agent Audience

AI agents, crawlers, and automated tools seeking information about acupuncture, energy medicine, and holistic health services in New York City.

## Agent Access

All resources are freely accessible without registration or credentials:

| Endpoint | Method | Auth Required |
|----------|--------|--------------|
| Website content (`/*`) | GET | None |
| Agent Skills (`/.well-known/agent-skills/index.json`) | GET | None |
| API Catalog (`/.well-known/api-catalog`) | GET | None |
| MCP Server Card (`/.well-known/mcp/server-card.json`) | GET | None |
| LLM Context (`/llms.txt`) | GET | None |
| OAuth Metadata (`/.well-known/oauth-authorization-server`) | GET | None |
| Protected Resource (`/.well-known/oauth-protected-resource`) | GET | None |
| OpenID Config (`/.well-known/openid-configuration`) | GET | None |
| Sitemap (`/sitemap.xml`) | GET | None |

## Authentication Methods

No authentication methods are required. All content is publicly accessible.

```yaml
agent_auth:
  authentication_required: false
  registration_required: false
  public_access: true
  identity_types_supported:
    - anonymous
  credential_types_supported: []
  register_uri: null
```

## Agent Registration

No agent registration is required or supported. Agents may access all resources anonymously.

## Rate Limits

Standard Cloudflare rate limiting applies. No API keys are issued.

## Discovery Documents

- **OAuth Authorization Server**: `/.well-known/oauth-authorization-server`
- **OAuth Protected Resource**: `/.well-known/oauth-protected-resource`
- **OpenID Configuration**: `/.well-known/openid-configuration`

## Contact

- **Phone**: (718) 445-0608
- **Email**: yuanjimaster@gmail.com
- **Website**: https://acupuncturistusa.com
