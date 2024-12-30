import User from "../../database/models/user";

class APIFilters {
	constructor(query, queryStr) {
		this.query = query;
		this.queryStr = queryStr;
		this.isAggregate = Array.isArray(this.query);
	}

	search() {
		const { name, author, page } = this.queryStr;
		const searchObj = {};

		if (name?.trim()) {
			const cleanedName = name.replace(/\+/g, " ");
			const decodedName = decodeURIComponent(cleanedName);
			const searchTerms = decodedName
				.split(",")
				.map((term) => term.trim())
				.filter((term) => term.length > 0);

			if (searchTerms.length > 0) {
				searchObj.$or = [
					{
						name: {
							$regex: searchTerms.map((term) => `.*${term}.*`).join("|"),
							$options: "i",
						},
					},
					{
						description: {
							$regex: searchTerms.map((term) => `.*${term}.*`).join("|"),
							$options: "i",
						},
					},
				];
			}
		}

		if (author?.trim()) {
			return User.find({ name: { $regex: author, $options: "i" } })
				.select("_id")
				.then((authors) => {
					searchObj.author = { $in: authors.map(({ _id }) => _id) };
					this.query = this.query.find(searchObj);
					return this;
				});
		}

		if (Object.keys(searchObj).length) {
			this.isAggregate
				? this.query.push({ $match: searchObj })
				: (this.query = this.query.find(searchObj));
		}

		return this;
	}

	filter() {
		const queryCopy = { ...this.queryStr };
		const removeFields = [
			"page", "name", "author", "createdAtStart", "createdAtEnd", "sort",
			"activities", "constraints", "density", "separability",
			"constraintVariability", "applicationDomain", "purpose"
		];
		removeFields.forEach((el) => delete queryCopy[el]);

		const filterObj = { $and: [] };

		if (this.queryStr.createdAtStart || this.queryStr.createdAtEnd) {
			const dateFilter = { createdAt: {} };
			if (this.queryStr.createdAtStart) {
				dateFilter.createdAt.$gte = new Date(this.queryStr.createdAtStart);
			}
			if (this.queryStr.createdAtEnd) {
				dateFilter.createdAt.$lte = new Date(this.queryStr.createdAtEnd);
			}
			filterObj.$and.push(dateFilter);
		}

		const metricFilters = {
			density: {
				metricID: "SN2",
				ranges: {
					low: { $lt: 0.5 },
					medium: { $and: [{ $gte: 0.5 }, { $lte: 1.5 }] },
					high: { $gt: 1.5 }
				}
			},
			separability: {
				metricID: "SN6",
				ranges: {
					low: { $lt: 0.33 },
					medium: { $and: [{ $gte: 0.33 }, { $lte: 0.66 }] },
					high: { $gt: 0.67 }
				}
			},
			constraintVariability: {
				metricID: "SN3",
				ranges: {
					low: { $lt: 0.33 },
					medium: { $and: [{ $gte: 0.33 }, { $lte: 0.66 }] },
					high: { $gt: 0.67 }
				}
			}
		};

		Object.entries(metricFilters).forEach(([filterType, config]) => {
			if (this.queryStr[filterType]) {
				const range = config.ranges[this.queryStr[filterType]];
				if (range) {
					filterObj.$and.push({
						metrics: {
							$elemMatch: {
								metricID: config.metricID,
								calculationResult: {
									$ne: "N/A",
									...(range.$and ? { $gte: range.$and[0].$gte, $lte: range.$and[1].$lte } : range)
								}
							}
						}
					});
				}
			}
		});

		if (this.queryStr.applicationDomain) {
			filterObj.$and.push({
				metrics: {
					$elemMatch: {
						metricID: "SO2",
						calculationResult: this.queryStr.applicationDomain
					}
				}
			});
		}

		if (this.queryStr.purpose) {
			filterObj.$and.push({
				metrics: {
					$elemMatch: {
						metricID: "SO1",
						calculationResult: this.queryStr.purpose
					}
				}
			});
		}

		if (filterObj.$and.length > 0) {
			this.isAggregate
				? this.query.push({ $match: filterObj })
				: (this.query = this.query.find(filterObj));
		}

		return this;
	}

	sort() {
		if (this.queryStr.sort) {
			let sortField = this.queryStr.sort;
			let sortOrder = 1;

			if (this.queryStr.sort.includes('_')) {
				const [field, direction] = this.queryStr.sort.split('_');
				sortField = field;
				sortOrder = direction === 'desc' ? -1 : 1;
			}

			if (sortField === 'activities' || sortField === 'constraints') {
				const metricID = sortField === 'activities' ? 'SN4' : 'SN5';
				if (this.isAggregate) {
					this.query.push({
						$addFields: {
							sortValue: {
								$convert: {
									input: {
										$first: {
											$map: {
												input: {
													$filter: {
														input: "$metrics",
														as: "m",
														cond: { $eq: ["$$m.metricID", metricID] }
													}
												},
												as: "metric",
												in: {
													$cond: [
														{ $eq: ["$$metric.calculationResult", "N/A"] },
														0,
														{ $toDouble: "$$metric.calculationResult" }
													]
												}
											}
										}
									},
									to: "double",
									onError: 0,
									onNull: 0
								}
							}
						}
					});

					this.query.push({ $sort: { sortValue: sortOrder } });
				}
			} else {
				if (this.isAggregate) {
					this.query.push({ $sort: { [sortField]: sortOrder } });
				} else {
					this.query = this.query.sort({ [sortField]: sortOrder });
				}
			}
		}
		return this;
	}


	limitFields() {
		if (this.queryStr.fields) {
			const fields = this.queryStr.fields.split(",").join(" ");
			if (this.isAggregate) {
				this.query.push({
					$project: fields
						.split(" ")
						.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}),
				});
			} else {
				this.query = this.query.select(fields);
			}
		}
		return this;
	}

	paginate(resPerPage) {
		const page = Number.parseInt(this.queryStr.page, 10) || 1;
		const limit = Number.parseInt(resPerPage, 10) || 100;
		const skip = (page - 1) * limit;

		if (this.isAggregate) {
			this.query.push({ $skip: skip }, { $limit: limit });
		} else {
			this.query = this.query.skip(skip).limit(limit);
		}
		return this;
	}

	declareAndModelGroup() {
		if (!this.isAggregate) {
			throw new Error(
				"declareAndModelGroup can only be used with aggregation pipelines",
			);
		}
		this.query.push({
			$group: {
				_id: "$declareModel",
				modelName: { $first: "$declareModel.name" },
				metrics: {
					$push: {
						metricId: "$metric._id",
						metricName: "$metric.name",
						calculationResult: "$calculationResult",
					},
				},
			},
		});
		return this;
	}
}

export default APIFilters;
