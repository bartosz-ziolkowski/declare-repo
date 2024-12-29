const apiConfig = {
	openapi: "3.0.0",
	info: {
		title: "Declare Repository - API Documentation",
		version: "1.0.0",
		description: "Documentation for Declarative Models and Metrics",
	},
	servers: [
		{
			url: process.env.API_URI,
			description: "API Server",
		},
	],
	tags: [
		{
			name: "Authentication",
			description: "Authentication and user management operations",
		},
		{
			name: "Repository",
			description: "Repository operations",
		},
		{
			name: "Models",
			description: "Model management operations",
		},
		{
			name: "Metrics",
			description: "Metrics management operations",
		},
	],
	paths: {
		"/api/register": {
			"post": {
				"tags": ["Authentication"],
				"summary": "Register new user",
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"type": "object",
								"properties": {
									"name": {
										"type": "string",
										"description": "The name of the user"
									},
									"email": {
										"type": "string",
										"format": "email",
										"description": "The email address of the user",
										"pattern": "^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$"
									},
									"password": {
										"type": "string",
										"description": "The password for the user",
										"minLength": 6
									}
								},
								"required": ["name", "email", "password"]
							}
						}
					}
				},
				"responses": {
					"201": {
						"description": "User successfully registered"
					},
					"400": {
						"description": "Invalid input"
					}
				}
			}
		},

		"/api/repo/all": {
			get: {
				tags: ["Repository"],
				summary: "Get all models with metrics",
				description: "Returns all models merged with their metrics",
				responses: {
					200: {
						description: "Successful response",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/ModelWithMetrics",
									},
								},
							},
						},
					},
				},
			},
		},
		"/api/repo/metrics": {
			get: {
				tags: ["Metrics"],
				summary: "Get all metrics",
				responses: {
					200: {
						description: "List of all metrics",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/MetricResponse",
								},
							},
						},
					},
				},
			},
		},
		"/api/repo/metrics/{id}": {
			get: {
				tags: ["Metrics"],
				summary: "Get metric by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Metric details",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/Metric",
								},
							},
						},
					},
				},
			},
			patch: {
				tags: ["Metrics"],
				summary: "Update metric",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: { type: "string" },
									description: { type: "string" },
									formula: { type: "string" },
									reference: {
										type: "object",
										properties: {
											name: { type: "string" },
											url: { type: "string" },
										},
									},
								},
								example: {
									name: "Updated Metric Name",
									description: "Updated Metric Description",
									formula: "Updated Formula",
									reference: {
										name: "Reference Name",
										url: "https://example.com/reference",
									},
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: "Metric updated successfully",
					},
					400: {
						description: "Invalid input",
					},
				},
			},
			delete: {
				tags: ["Metrics"],
				summary: "Delete metric",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Metric deleted successfully",
					},
				},
			},
		},
		"/api/repo/models": {
			get: {
				tags: ["Models"],
				summary: "Retrieve all models",
				description: "Fetch a list of all models available in the repository, including metadata.",
				responses: {
					200: {
						description: "Successful response containing a list of models",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/ModelResponse"
									}
								}
							}
						}
					},
					500: {
						description: "Internal server error"
					}
				}
			},
			post: {
				"tags": ["Models"],
				"summary": "Create new model",
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"type": "object",
								"properties": {
									"name": {
										"type": "string",
										"description": "The name of the model"
									},
									"description": {
										"type": "string",
										"description": "A description of the model"
									},
									"reference": {
										"type": "object",
										"properties": {
											"name": {
												"type": "string",
												"description": "The reference name"
											},
											"url": {
												"type": "string",
												"description": "The reference URL"
											}
										}
									}
								},
								"required": ["name", "description"],
								"example": {
									"name": "New Model",
									"description": "Description of new model",
									"reference": {
										"name": "Reference Name",
										"url": "https://example.com/reference"
									}
								}
							}
						}
					}
				},
				"responses": {
					"201": {
						"description": "Model created successfully",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/Model"
								}
							}
						}
					},
					"400": {
						"description": "Invalid input"
					}
				}
			}
		},
		"/api/repo/metrics": {
			get: {
				tags: ["Metrics"],
				summary: "Get all metrics",
				responses: {
					200: {
						description: "List of all metrics",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/MetricResponse",
								},
							},
						},
					},
				},
			},
			post: {
				tags: ["Metrics"],
				summary: "Create new metric",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									ID: {
										type: "string",
										pattern: "^[A-Z]{2}\\d+$",
										description: "Unique identifier for the metric. Must start with two uppercase letters followed by digits."
									},
									name: {
										type: "string",
										description: "Name of the metric."
									},
									description: {
										type: "string",
										description: "Description of the metric."
									},
									formula: {
										type: "string",
										description: "Formula used to calculate the metric."
									},
									reference: {
										type: "object",
										properties: {
											name: {
												type: "string",
												description: "Name of the reference."
											},
											url: {
												type: "string",
												description: "URL of the reference."
											}
										}
									}
								},
								required: ["ID", "name", "description"],
								example: {
									ID: "AB123",
									name: "New Metric",
									description: "Description of new metric",
									formula: "New Formula",
									reference: {
										name: "Reference Name",
										url: "https://example.com/reference"
									}
								}
							}
						}
					}
				},
				responses: {
					201: {
						description: "Metric created successfully",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/Metric"
								}
							}
						}
					},
					400: {
						description: "Invalid input"
					}
				}
			}

		},
		"/api/repo/models/{id}": {
			get: {
				tags: ["Models"],
				summary: "Get model by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Model details",
					},
				},
			},
			patch: {
				tags: ["Models"],
				summary: "Update model",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: { type: "string" },
									description: { type: "string" },
									reference: {
										type: "object",
										properties: {
											name: { type: "string" },
											url: { type: "string" },
										},
									},
								},
								example: {
									name: "Updated Model Name",
									description: "Updated Model Description",
									reference: {
										name: "Reference Name",
										url: "https://example.com/reference",
									},
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: "Model updated successfully",
					},
					400: {
						description: "Invalid input",
					},
				},
			},
			delete: {
				tags: ["Models"],
				summary: "Delete model",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Model deleted successfully",
					},
				},
			},
		},
	},
	components: {
		schemas: {
			ModelResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					totalCount: { type: "integer" },
					filteredCount: { type: "integer" },
					resPerPage: { type: "integer" },
					models: {
						type: "array",
						items: { $ref: "#/components/schemas/Model" },
					},
				},
			},
			Model: {
				type: "object",
				properties: {
					_id: { type: "string" },
					name: { type: "string" },
					description: { type: "string" },
					contentURL: { type: "string", nullable: true },
					textRepURL: { type: "string", nullable: true },
					imageURL: { type: "string", nullable: true },
					automataUrl: { type: "string", nullable: true },
					public: { type: "boolean" },
					reference: {
						type: "object",
						properties: {
							name: { type: "string", nullable: true },
							url: { type: "string", nullable: true },
						},
					},
					author: { $ref: "#/components/schemas/Author" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			MetricResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					totalCount: { type: "integer" },
					filteredCount: { type: "integer" },
					resPerPage: { type: "integer" },
					metrics: {
						type: "array",
						items: { $ref: "#/components/schemas/Metric" },
					},
				},
			},
			Metric: {
				type: "object",
				properties: {
					_id: { type: "string" },
					ID: { type: "string" },
					name: { type: "string" },
					description: { type: "string" },
					formula: { type: "string" },
					public: { type: "boolean" },
					reference: {
						type: "object",
						properties: {
							name: { type: "string" },
							url: { type: "string" },
						},
					},
					author: {
						type: "object",
						nullable: true,
					},
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Author: {
				type: "object",
				required: ["name", "email", "password"],
				properties: {
					_id: { type: "string" },
					name: {
						type: "string",
						minLength: 1,
						description: "User's full name",
					},
					email: {
						type: "string",
						format: "email",
						description: "User's email address",
						pattern: "^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$",
					},
					password: {
						type: "string",
						minLength: 6,
						writeOnly: true,
						description: "User's password",
					},
					role: {
						type: "string",
						enum: ["user", "admin", "moderator"],
						default: "user",
						description: "User's role in the system",
					},
					createdAt: {
						type: "string",
						format: "date-time",
						description: "Timestamp when the user was created",
					},
					updatedAt: {
						type: "string",
						format: "date-time",
						description: "Timestamp when the user was last updated",
					},
				},
			},
			UserRegistration: {
				type: "object",
				properties: {
					name: {
						type: "string",
						minLength: 1,
						description: "User's full name",
					},
					email: {
						type: "string",
						format: "email",
						description: "User's email address",
						pattern: "^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$",
					},
					password: {
						type: "string",
						minLength: 6,
						writeOnly: true,
						description: "User's password",
					},
				},
				required: ["name", "email", "password"],
			},
		},
	},
};

export default apiConfig;
