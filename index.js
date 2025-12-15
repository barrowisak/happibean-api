import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Zendesk config from environment
const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN // e.g., 'yourcompany'
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL // e.g., 'support@yourcompany.com'
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN

// B2B subdomain for help center (articles, search)
const ZENDESK_B2B_SUBDOMAIN = process.env.ZENDESK_B2B_SUBDOMAIN || 'pdi-happibean-b2b'

const ZENDESK_BASE_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com`
const ZENDESK_B2B_URL = `https://${ZENDESK_B2B_SUBDOMAIN}.zendesk.com`

// Create Basic Auth header for Zendesk API
const getAuthHeader = () => {
  const credentials = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64')
  return `Basic ${credentials}`
}

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

/**
 * Get all Help Center categories (from B2B help center, public only)
 * GET /help-center/categories
 */
app.get('/help-center/categories', async (req, res) => {
  try {
    // Use B2B help center for articles - NO AUTH to get only public content
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/categories.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch categories' })
    }

    const data = await response.json()
    const categories = data.categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      html_url: cat.html_url
    })) || []

    res.json({ categories })
  } catch (error) {
    console.error('Categories fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get sections within a category (from B2B help center, public only)
 * GET /help-center/categories/:categoryId/sections
 */
app.get('/help-center/categories/:categoryId/sections', async (req, res) => {
  try {
    const { categoryId } = req.params
    // NO AUTH to get only public content
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/categories/${categoryId}/sections.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch sections' })
    }

    const data = await response.json()
    const sections = data.sections?.map(sec => ({
      id: sec.id,
      name: sec.name,
      description: sec.description,
      html_url: sec.html_url,
      category_id: sec.category_id
    })) || []

    res.json({ sections })
  } catch (error) {
    console.error('Sections fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get articles within a section (from B2B help center, public only)
 * GET /help-center/sections/:sectionId/articles
 */
app.get('/help-center/sections/:sectionId/articles', async (req, res) => {
  try {
    const { sectionId } = req.params
    // NO AUTH to get only public content
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/sections/${sectionId}/articles.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch articles' })
    }

    const data = await response.json()
    const articles = data.articles?.map(art => ({
      id: art.id,
      title: art.title,
      body: art.body,
      html_url: art.html_url,
      section_id: art.section_id
    })) || []

    res.json({ articles })
  } catch (error) {
    console.error('Articles fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get a single section (from B2B help center, public only)
 * GET /help-center/sections/:sectionId
 */
app.get('/help-center/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/sections/${sectionId}.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch section' })
    }

    const data = await response.json()
    const section = data.section ? {
      id: data.section.id,
      name: data.section.name,
      description: data.section.description,
      html_url: data.section.html_url,
      category_id: data.section.category_id
    } : null

    res.json({ section })
  } catch (error) {
    console.error('Section fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get a single category (from B2B help center, public only)
 * GET /help-center/categories/:categoryId
 */
app.get('/help-center/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/categories/${categoryId}.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch category' })
    }

    const data = await response.json()
    const category = data.category ? {
      id: data.category.id,
      name: data.category.name,
      description: data.category.description,
      html_url: data.category.html_url
    } : null

    res.json({ category })
  } catch (error) {
    console.error('Category fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get a single article (from B2B help center, public only)
 * GET /help-center/articles/:articleId
 */
app.get('/help-center/articles/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params
    // NO AUTH to get only public content
    const url = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/articles/${articleId}.json`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch article' })
    }

    const data = await response.json()
    const article = data.article ? {
      id: data.article.id,
      title: data.article.title,
      body: data.article.body,
      html_url: data.article.html_url,
      section_id: data.article.section_id
    } : null

    res.json({ article })
  } catch (error) {
    console.error('Article fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * FAQ Search - fetches all articles and filters locally with ranking
 * (Zendesk Help Center search API requires it to be enabled)
 * GET /faq/search?q=<query>
 */
app.get('/faq/search', async (req, res) => {
  try {
    const query = req.query.q

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    // Fetch ALL articles from B2B help center (handle pagination)
    let allArticles = []
    let nextPage = `${ZENDESK_B2B_URL}/api/v2/help_center/en-gb/articles.json?per_page=100`

    while (nextPage) {
      const response = await fetch(nextPage)
      if (!response.ok) {
        console.error('Zendesk articles fetch error:', response.status)
        break
      }
      const data = await response.json()
      allArticles = allArticles.concat(data.articles || [])
      nextPage = data.next_page // null when no more pages
    }

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0)

    // Filter and score articles
    const scoredResults = allArticles
      .map(article => {
        const title = (article.title || '').toLowerCase()
        const body = (article.body || '').toLowerCase()

        // Calculate match score
        let score = 0
        let allTermsMatch = true

        for (const term of searchTerms) {
          const titleMatch = title.includes(term)
          const bodyMatch = body.includes(term)

          if (!titleMatch && !bodyMatch) {
            allTermsMatch = false
            break
          }

          // Title matches are worth more
          if (titleMatch) score += 10
          if (bodyMatch) score += 1

          // Exact word match bonus
          if (title.match(new RegExp(`\\b${term}\\b`))) score += 5
        }

        return { article, score, allTermsMatch }
      })
      .filter(item => item.allTermsMatch)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => ({
        id: item.article.id,
        title: item.article.title,
        body: item.article.body || '',
        html_url: item.article.html_url
      }))

    res.json({ results: scoredResults, count: scoredResults.length })

  } catch (error) {
    console.error('FAQ search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get all ticket forms
 * GET /ticket-forms
 */
app.get('/ticket-forms', async (req, res) => {
  try {
    const url = `${ZENDESK_BASE_URL}/api/v2/ticket_forms.json?active=true&end_user_visible=true`
    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not fetch ticket forms' })
    }

    const data = await response.json()
    const forms = data.ticket_forms?.map(form => ({
      id: form.id,
      name: form.name,
      display_name: form.display_name,
      active: form.active,
      default: form.default,
      ticket_field_ids: form.ticket_field_ids
    })) || []

    res.json({ forms })
  } catch (error) {
    console.error('Ticket forms fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get a specific ticket form with its fields
 * GET /ticket-forms/:formId
 */
app.get('/ticket-forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params

    // Fetch the form
    const formUrl = `${ZENDESK_BASE_URL}/api/v2/ticket_forms/${formId}.json`
    const formResponse = await fetch(formUrl, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })

    if (!formResponse.ok) {
      return res.status(formResponse.status).json({ error: 'Could not fetch ticket form' })
    }

    const formData = await formResponse.json()
    const form = formData.ticket_form

    // Fetch all ticket fields to get details
    const fieldsUrl = `${ZENDESK_BASE_URL}/api/v2/ticket_fields.json`
    const fieldsResponse = await fetch(fieldsUrl, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })

    let fields = []
    if (fieldsResponse.ok) {
      const fieldsData = await fieldsResponse.json()
      // Filter to only fields in this form and visible to end users
      fields = fieldsData.ticket_fields
        ?.filter(f => form.ticket_field_ids?.includes(f.id) && f.visible_in_portal)
        ?.map(f => ({
          id: f.id,
          type: f.type,
          title: f.title,
          description: f.description,
          required: f.required_in_portal,
          options: f.custom_field_options || f.system_field_options || []
        })) || []
    }

    // Get conditional field rules
    const conditions = form.end_user_conditions || []

    res.json({
      form: {
        id: form.id,
        name: form.name,
        display_name: form.display_name
      },
      fields,
      conditions
    })
  } catch (error) {
    console.error('Ticket form fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Create Support Request - proxies to Zendesk Requests API
 * POST /requests
 * Body: { name, email, subject, message, category, ticket_form_id, custom_fields }
 */
app.post('/requests', async (req, res) => {
  try {
    const { name, email, subject, message, category, ticket_form_id, custom_fields } = req.body

    // Validation
    if (!email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: email, subject, message'
      })
    }

    if (!ZENDESK_SUBDOMAIN || !ZENDESK_API_TOKEN) {
      return res.status(500).json({ error: 'Zendesk not configured' })
    }

    // Map category to custom field or tag
    const tags = ['support-widget']
    if (category) {
      tags.push(category)
    }

    // Create request via Zendesk Requests API
    // Documentation: https://developer.zendesk.com/api-reference/ticketing/tickets/ticket-requests/
    const requestUrl = `${ZENDESK_BASE_URL}/api/v2/requests.json`

    const zendeskPayload = {
      request: {
        requester: {
          name: name || email.split('@')[0],
          email: email
        },
        subject: subject,
        comment: {
          body: message
        },
        tags: tags
      }
    }

    // Add ticket form if specified
    if (ticket_form_id) {
      zendeskPayload.request.ticket_form_id = ticket_form_id
    }

    // Add custom fields if specified
    if (custom_fields && Array.isArray(custom_fields)) {
      zendeskPayload.request.custom_fields = custom_fields
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zendeskPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zendesk request creation error:', response.status, errorText)

      if (response.status === 422) {
        return res.status(422).json({ error: 'Invalid request data' })
      }

      return res.status(response.status).json({ error: 'Could not create request' })
    }

    const data = await response.json()

    res.status(201).json({
      success: true,
      request_id: data.request?.id,
      message: 'Request created successfully'
    })

  } catch (error) {
    console.error('Request creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Support Widget API running on port ${PORT}`)
  console.log(`Zendesk subdomain: ${ZENDESK_SUBDOMAIN || 'NOT CONFIGURED'}`)
})
