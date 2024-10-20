import User from "../../database/models/user";

class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.isAggregate = Array.isArray(this.query);
  }

search() {
  const { name, author } = this.queryStr;
  const searchObj = {};

  if (name?.trim()) searchObj.name = { $regex: name, $options: "i" };

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
      : this.query = this.query.find(searchObj);
  }

  return this;
}


  filter() {
  const queryCopy = { ...this.queryStr };
  const removeFields = [
    "page",
    "name",
    "author",
    "createdAtStart",
    "createdAtEnd",
    "sort",
  ];
  removeFields.forEach((el) => delete queryCopy[el]);

  const filterObj = {};

  if (this.queryStr.createdAtStart || this.queryStr.createdAtEnd) {
    filterObj.createdAt = {};
    if (this.queryStr.createdAtStart && this.queryStr.createdAtStart !== "") {
      filterObj.createdAt.$gte = new Date(this.queryStr.createdAtStart);
    }
    if (this.queryStr.createdAtEnd && this.queryStr.createdAtEnd !== "") {
      filterObj.createdAt.$lte = new Date(this.queryStr.createdAtEnd);
    }
  }

  Object.keys(queryCopy).forEach(key => {
    if (queryCopy[key] !== '') {
      filterObj[key] = queryCopy[key];
    }
  });

  if (Object.keys(filterObj).length > 0) {
    if (this.isAggregate) {
      this.query.push({ $match: filterObj });
    } else {
      this.query = this.query.find(filterObj);
    }
  }

  return this;
}

  sort() {
    if (this.queryStr.sort) {
      const [field, order] = this.queryStr.sort.split("_");
      const sortOrder = order === "asc" ? 1 : -1;

      if (this.isAggregate) {
        this.query.push({ $sort: { [field]: sortOrder } });
      } else {
        this.query = this.query.sort({ [field]: sortOrder });
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
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(resPerPage, 10) || 100;
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
        "declareAndModelGroup can only be used with aggregation pipelines"
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
