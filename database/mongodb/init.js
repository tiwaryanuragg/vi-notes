db = db.getSiblingDB("vi_notes");

db.createCollection("writingsessions", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["sessionId", "status", "startedAt"],
			properties: {
				sessionId: { bsonType: "string" },
				status: { enum: ["active", "completed"] },
				startedAt: { bsonType: "date" },
				endedAt: { bsonType: ["date", "null"] },
				textSnapshot: { bsonType: "string" },
			},
		},
	},
});

db.createCollection("authenticityreports", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["sessionId", "confidenceScore", "label", "shareToken"],
			properties: {
				sessionId: { bsonType: "string" },
				confidenceScore: { bsonType: ["int", "long", "double", "decimal"] },
				label: {
					enum: ["Likely Human", "Needs Review", "Likely AI-Assisted"],
				},
				shareToken: { bsonType: "string" },
			},
		},
	},
});

db.createCollection("users", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["fullName", "email", "passwordHash", "role"],
			properties: {
				fullName: { bsonType: "string" },
				email: { bsonType: "string" },
				passwordHash: { bsonType: "string" },
				role: { enum: ["Student", "Professional", "Writer"] },
			},
		},
	},
});

db.writingsessions.createIndex({ sessionId: 1 }, { unique: true });
db.writingsessions.createIndex({ userId: 1, createdAt: -1 });
db.writingsessions.createIndex({ status: 1, createdAt: -1 });

db.authenticityreports.createIndex({ sessionId: 1 }, { unique: true });
db.authenticityreports.createIndex({ shareToken: 1 }, { unique: true });
db.authenticityreports.createIndex({ createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

print("Vi-Notes MongoDB initialized with collections and indexes.");
