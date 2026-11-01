require("dotenv").config();
const mongoose = require("mongoose");
const Supplier = require("./models/Supplier");
const Material = require("./models/Material");
const PriceHistory = require("./models/PriceHistory");

const sampleSuppliers = [
    {
        businessName: "Apex Concrete & Aggregates",
        contactEmail: "contact@apexconcrete.in",
        phone: "+91 98220 11223",
        location: {
            address: "Plot 18, Hadapsar Industrial Estate",
            city: "Pune",
            state: "Maharashtra",
            zipCode: "411028",
        },
        description:
            "Certified distributor of ultra-high strength cement, pre-mix aggregates, and ready-mix solutions across western Maharashtra.",
        rating: 4.9,
        reliabilityScore: 98,
        onTimeDeliveryRate: 98.5,
        isVerified: true,
        categoriesSupplied: ["Cement", "Sand", "Aggregates"],
        avatar: "🏭",
    },
    {
        businessName: "Deccan Steel & Rebar Co.",
        contactEmail: "sales@deccansteel.com",
        phone: "+91 98221 44556",
        location: {
            address: "Phase II, Chakan MIDC",
            city: "Pune",
            state: "Maharashtra",
            zipCode: "410501",
        },
        description:
            "Authorized primary stockist for high-ductility Fe550D TMT rebars, structural girders, and earthquake-resistant rebar bundles.",
        rating: 4.8,
        reliabilityScore: 96,
        onTimeDeliveryRate: 97.0,
        isVerified: true,
        categoriesSupplied: ["Steel"],
        avatar: "🏗️",
    },
    {
        businessName: "EcoBuild Brickworks & Blocks",
        contactEmail: "info@ecobuild.co",
        phone: "+91 98223 77889",
        location: {
            address: "Satpur Industrial Area",
            city: "Nashik",
            state: "Maharashtra",
            zipCode: "422007",
        },
        description:
            "Green building pioneer producing low-carbon AAC autoclaved blocks, fly-ash pavers, and precision wire-cut bricks.",
        rating: 4.7,
        reliabilityScore: 95,
        onTimeDeliveryRate: 96.0,
        isVerified: true,
        categoriesSupplied: ["Bricks"],
        avatar: "🧱",
    },
    {
        businessName: "Western Aggregates & Sands",
        contactEmail: "orders@westernsands.in",
        phone: "+91 98225 99001",
        location: {
            address: "Taloja MIDC Road",
            city: "Navi Mumbai",
            state: "Maharashtra",
            zipCode: "410208",
        },
        description:
            "Sustainably sourced natural river sand, manufactured sand (M-sand), and graded aggregates for high-durability casting.",
        rating: 4.6,
        reliabilityScore: 93,
        onTimeDeliveryRate: 95.0,
        isVerified: true,
        categoriesSupplied: ["Sand", "Aggregates"],
        avatar: "🚚",
    },
];

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB for seeding...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully!");

        // 1. Seed Suppliers
        console.log("Clearing existing suppliers, materials, and price history...");
        await Supplier.deleteMany({});
        await Material.deleteMany({});
        await PriceHistory.deleteMany({});

        const createdSuppliers = await Supplier.insertMany(sampleSuppliers);
        console.log(`Seeded ${createdSuppliers.length} suppliers.`);

        const [apex, deccan, ecoBricks, westernSands] = createdSuppliers;

        // 2. Define Materials with realistic engineering specs
        const sampleMaterials = [
            {
                name: "Premium OPC 53-Grade Cement",
                category: "Cement",
                price: 380,
                unit: "/ bag",
                description: "High early compressive strength suitable for multi-story columns, beams, and precast foundations.",
                image: "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=800&q=85",
                tag: "Popular",
                specs: {
                    Type: "Ordinary Portland Cement (53-Grade)",
                    Packaging: "50 kg laminated moisture-proof bag",
                    "Compressive Strength": "53 MPa at 28 days",
                    Application: "High-load RCC structural members",
                    Standard: "IS 269:2015 compliant",
                },
                stock: 850,
                isEcoFriendly: false,
                sustainabilityScore: 55,
                carbonFootprint: "Standard OPC carbon profile (~820 kg CO2/tonne)",
                supplier: apex._id,
                supplierName: apex.businessName,
                isAvailable: true,
                minOrderQuantity: 10,
            },
            {
                name: "Fly-Ash Pozzolana Eco-Cement (PPC)",
                category: "Cement",
                price: 355,
                unit: "/ bag",
                description: "Sustainable blended cement engineered with pozzolanic materials for lower thermal heat of hydration and salt resistance.",
                image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=85",
                tag: "Eco-friendly",
                specs: {
                    Type: "Portland Pozzolana Cement (PPC)",
                    Packaging: "50 kg bag",
                    "Pozzolanic Blend": "28% recycled fly-ash content",
                    Application: "Plastering, masonry, marine structures, mass concreting",
                    Standard: "IS 1489 (Part 1):2015 compliant",
                },
                stock: 1200,
                isEcoFriendly: true,
                sustainabilityScore: 88,
                carbonFootprint: "24% lower embodied emissions vs OPC",
                supplier: apex._id,
                supplierName: apex.businessName,
                isAvailable: true,
                minOrderQuantity: 10,
            },
            {
                name: "Tata Tiscon 550D TMT Rebar (12mm)",
                category: "Steel",
                price: 64,
                unit: "/ kg",
                description: "Super-ductile thermo-mechanically treated rebar offering superior energy absorption during seismic events.",
                image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=85",
                tag: "High strength",
                specs: {
                    Grade: "Fe 550D (High Ductility)",
                    Diameter: "12 mm nominal",
                    "Yield Strength": "550 N/mm² minimum",
                    Elongation: "16% minimum",
                    Standard: "IS 1786:2008 compliant",
                },
                stock: 5000,
                isEcoFriendly: false,
                sustainabilityScore: 65,
                carbonFootprint: "Electric Arc Furnace recycled scrap blend",
                supplier: deccan._id,
                supplierName: deccan.businessName,
                isAvailable: true,
                minOrderQuantity: 100,
            },
            {
                name: "Corrosion-Resistant Structural Steel (CRS Fe500)",
                category: "Steel",
                price: 72,
                unit: "/ kg",
                description: "Alloyed with copper and chromium to resist coastal salinity, acidic groundwater, and humid tropical degradation.",
                image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=800&q=85",
                tag: "Marine Grade",
                specs: {
                    Grade: "Fe 500 CRS",
                    Corrosion: "3x greater atmospheric corrosion resistance",
                    Application: "Coastal foundations, retaining structures, bridge piers",
                    Standard: "IS 1786 certified",
                },
                stock: 3500,
                isEcoFriendly: true,
                sustainabilityScore: 82,
                carbonFootprint: "Extends structural life by 40+ years",
                supplier: deccan._id,
                supplierName: deccan.businessName,
                isAvailable: true,
                minOrderQuantity: 100,
            },
            {
                name: "Standard Wire-Cut Red Clay Bricks",
                category: "Bricks",
                price: 9.5,
                unit: "/ piece",
                description: "Dense, kiln-fired modular clay bricks with uniform dimensions and high water-weathering resistance.",
                image: "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=800&q=85",
                tag: "Best value",
                specs: {
                    Dimensions: "230 mm x 115 mm x 75 mm",
                    "Crushing Strength": "7.5 N/mm²",
                    "Water Absorption": "< 15% by weight",
                    Application: "Load-bearing and partition walls",
                    Standard: "IS 1077 compliant",
                },
                stock: 25000,
                isEcoFriendly: false,
                sustainabilityScore: 50,
                carbonFootprint: "Conventional coal kiln emission",
                supplier: ecoBricks._id,
                supplierName: ecoBricks.businessName,
                isAvailable: true,
                minOrderQuantity: 500,
            },
            {
                name: "Autoclaved Aerated Concrete (AAC) Blocks",
                category: "Bricks",
                price: 58,
                unit: "/ piece",
                description: "Ultra-lightweight precision masonry units delivering 3x thermal insulation and cutting dead weight by 50%.",
                image: "https://images.unsplash.com/photo-1584463699028-26e100f7e4c2?auto=format&fit=crop&w=800&q=85",
                tag: "Eco-friendly",
                specs: {
                    Dimensions: "600 mm x 200 mm x 150 mm",
                    Density: "550 - 650 kg/m³ (1/3 weight of red bricks)",
                    "Thermal Conductivity": "0.16 W/m-K (reduces air conditioning load)",
                    FireRating: "Up to 4 hours fire resistant",
                    Standard: "IS 2185 (Part 3) compliant",
                },
                stock: 4500,
                isEcoFriendly: true,
                sustainabilityScore: 92,
                carbonFootprint: "70% recycled industrial fly ash",
                supplier: ecoBricks._id,
                supplierName: ecoBricks.businessName,
                isAvailable: true,
                minOrderQuantity: 50,
            },
            {
                name: "River Sand (Double Washed)",
                category: "Sand",
                price: 1850,
                unit: "/ tonne",
                description: "Clean, silt-free river aggregate with natural sub-angular grains ensuring optimum cement-paste adhesion.",
                image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
                tag: "Essential",
                specs: {
                    Zone: "Zone II River Sand",
                    "Silt Content": "< 3% certified",
                    Application: "Concreting, plastering, tile bedding",
                    Standard: "IS 383:2016 compliant",
                },
                stock: 120,
                isEcoFriendly: false,
                sustainabilityScore: 48,
                carbonFootprint: "Riverbed extraction benchmark",
                supplier: westernSands._id,
                supplierName: westernSands.businessName,
                isAvailable: true,
                minOrderQuantity: 2,
            },
            {
                name: "Manufactured Sand (M-Sand Eco Aggregate)",
                category: "Sand",
                price: 1450,
                unit: "/ tonne",
                description: "Ecological crushed granite sand with controlled particle gradation, eliminating river ecosystem damage.",
                image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=85",
                tag: "Eco-friendly",
                specs: {
                    Zone: "Zone II Fine Aggregate",
                    Origin: "Triple-stage VSI crushed hard granite",
                    "Silt Content": "Zero organic impurities",
                    Application: "High-grade structural concrete",
                    Standard: "IS 383:2016 compliant",
                },
                stock: 350,
                isEcoFriendly: true,
                sustainabilityScore: 90,
                carbonFootprint: "Prevents riverbed dredging; 21% cost savings",
                supplier: westernSands._id,
                supplierName: westernSands.businessName,
                isAvailable: true,
                minOrderQuantity: 2,
            },
        ];

        const createdMaterials = await Material.insertMany(sampleMaterials);
        console.log(`Seeded ${createdMaterials.length} materials.`);

        // 3. Generate Historical Price Series for ML analytics (6 months data points)
        const priceHistoryDocs = [];
        const now = new Date();

        for (const mat of createdMaterials) {
            // Generate 6 historical data points: -5, -4, -3, -2, -1 months, and current
            const basePrice = mat.price;
            const varianceFactors = [0.93, 0.95, 0.97, 0.99, 1.02, 1.0]; // Realistic market fluctuations

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
                const factorIndex = 5 - i;
                const historicalPrice = Math.round(basePrice * varianceFactors[factorIndex]);
                const prevPrice = factorIndex > 0 ? Math.round(basePrice * varianceFactors[factorIndex - 1]) : historicalPrice;
                const trend = historicalPrice > prevPrice ? "rising" : historicalPrice < prevPrice ? "falling" : "stable";

                priceHistoryDocs.push({
                    material: mat._id,
                    materialName: mat.name,
                    price: historicalPrice,
                    recordedAt: date,
                    demandFactor: Number((0.9 + Math.random() * 0.3).toFixed(2)),
                    trend,
                    marketNote: i === 0 ? "Current live supplier listing price" : `Monthly historic trading benchmark for ${date.toLocaleString("default", { month: "short", year: "numeric" })}`,
                });
            }
        }

        await PriceHistory.insertMany(priceHistoryDocs);
        console.log(`Seeded ${priceHistoryDocs.length} historical price data points.`);

        console.log("Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed:", error);
        process.exit(1);
    }
}

seedDatabase();
