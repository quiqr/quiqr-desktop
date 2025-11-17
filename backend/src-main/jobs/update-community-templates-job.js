const Joi = require('joi');

// Joi schema that matches the CommunityTemplate interface
const communityTemplateSchema = Joi.object({
  HugoVersion: Joi.string().required(),
  HugoTheme: Joi.string().allow('').required(),
  QuiqrFormsEndPoints: Joi.number(),
  QuiqrModel: Joi.string().required(),
  QuiqrEtalageName: Joi.string(),
  QuiqrEtalageDescription: Joi.string(),
  QuiqrEtalageHomepage: Joi.string().uri().allow(''),
  QuiqrEtalageDemoUrl: Joi.string().uri().allow(''),
  QuiqrEtalageLicense: Joi.string(),
  QuiqrEtalageLicenseURL: Joi.string().uri().allow(''),
  QuiqrEtalageAuthor: Joi.string(),
  QuiqrEtalageAuthorHomepage: Joi.string().uri().allow(''),
  QuiqrEtalageScreenshots: Joi.array().items(Joi.string()),
  ScreenshotImageType: Joi.string(),
  SourceLink: Joi.string().uri().allow(''),
  NormalizedName: Joi.string().required()
});

// Schema for an array of templates
const templatesArraySchema = Joi.array().items(communityTemplateSchema);

const action = async () => {
  const url = "https://quiqr.github.io/quiqr-community-templates/templates.json";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Validate the data - assuming it's an array of templates
  const { error, value } = templatesArraySchema.validate(data, {
    abortEarly: false, // Get all validation errors, not just the first
    stripUnknown: true // Remove unknown properties
  });

  if (error) {
    throw new Error(`Invalid template data: ${error.message}`);
  }

  return value;
}

module.exports = action;
