import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { findBestMatch } from "@/lib/search-utils";

interface PlantData {
  name: string;
  Region: string;
  "Growing Months": string;
  Season: string;
  "Soil Requirements": string;
  "Bloom and Harvest Time": string;
  "Sunlight Needs": string;
  "Care Instructions": string;
  Image?: string;
}

interface PlantsDatabase {
  Plants: PlantData[];
}

// Original bloom data from the source
const bloomData: Record<string, { daysToGermination: number; daysToMaturity: number; bloomDuration: number; care: string[] }> = {
  'Marigold': {
    daysToGermination: 5,
    daysToMaturity: 50,
    bloomDuration: 90,
    care: ['Water regularly but not overwater', 'Full sun (6-8 hours daily)', 'Deadhead spent flowers', 'Well-drained soil essential']
  },
  'Rose': {
    daysToGermination: 10,
    daysToMaturity: 60,
    bloomDuration: 180,
    care: ['Requires deep watering', 'Morning sun essential', 'Regular pruning for bushier growth', 'Use rose fertilizer monthly']
  },
  'Zinnia': {
    daysToGermination: 7,
    daysToMaturity: 45,
    bloomDuration: 100,
    care: ['Water at soil level, not on leaves', 'Full sun required', 'Deadhead regularly', 'Pinch tips for bushier plants']
  },
  'Sunflower': {
    daysToGermination: 7,
    daysToMaturity: 60,
    bloomDuration: 70,
    care: ['Plant near support structure', 'Water deeply but less frequently', 'Full sun (8+ hours)', 'Tall varieties need staking']
  },
  'Dahlia': {
    daysToGermination: 14,
    daysToMaturity: 70,
    bloomDuration: 120,
    care: ['Plant tubers 6 inches deep', 'Stake early for support', 'Regular deadheading extends blooms', 'Fertilize every 2 weeks']
  },
  'Cosmos': {
    daysToGermination: 8,
    daysToMaturity: 55,
    bloomDuration: 90,
    care: ['Drought tolerant once established', 'Full sun', 'Minimal fertilizer needed', 'Deadhead for continuous blooms']
  },
  'Petunia': {
    daysToGermination: 10,
    daysToMaturity: 50,
    bloomDuration: 110,
    care: ['Regular watering essential', 'Full sun to partial shade', 'Deadhead weekly', 'Pinch for compact growth']
  },
  'Chrysanthemum': {
    daysToGermination: 12,
    daysToMaturity: 75,
    bloomDuration: 80,
    care: ['Full sun preferred', 'Keep soil moist', 'Pinch tips in summer', 'Fertilize every 2 weeks']
  },
  'Jasmine': {
    daysToGermination: 15,
    daysToMaturity: 90,
    bloomDuration: 150,
    care: ['Climbing variety - provide support', 'Partial sun', 'Regular watering during growing season', 'Fragrant flowers']
  },
  'Bougainvillea': {
    daysToGermination: 20,
    daysToMaturity: 120,
    bloomDuration: 180,
    care: ['Extremely drought tolerant', 'Full sun mandatory', 'Prune after flowering', 'Well-drained soil essential']
  },
  'Gladiolus': {
    daysToGermination: 10,
    daysToMaturity: 65,
    bloomDuration: 70,
    care: ['Plant corms 4 inches deep', 'Stake tall varieties', 'Plant succession for continuous blooms', 'Cut when first flower opens']
  },
  'Tulip': {
    daysToGermination: 14,
    daysToMaturity: 90,
    bloomDuration: 50,
    care: ['Chill bulbs before planting in warm climates', 'Full sun', 'Well-drained soil', 'Remove spent flowers']
  },
  'Pansy': {
    daysToGermination: 10,
    daysToMaturity: 60,
    bloomDuration: 120,
    care: ['Cool weather preferred', 'Partial shade in hot climate', 'Keep soil moist', 'Regular deadheading']
  },
  'Dianthus': {
    daysToGermination: 8,
    daysToMaturity: 50,
    bloomDuration: 90,
    care: ['Full sun required', 'Well-drained soil essential', 'Deadhead for extended bloom', 'Drought tolerant once established']
  },
  'Snapdragon': {
    daysToGermination: 10,
    daysToMaturity: 70,
    bloomDuration: 100,
    care: ['Full sun to partial shade', 'Keep soil consistently moist', 'Stake if needed', 'Pinch tips early for bushy growth']
  }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const flowerOptions = [
  { value: 'Marigold', label: 'Marigold (Genda)' },
  { value: 'Rose', label: 'Rose' },
  { value: 'Zinnia', label: 'Zinnia' },
  { value: 'Sunflower', label: 'Sunflower' },
  { value: 'Dahlia', label: 'Dahlia' },
  { value: 'Cosmos', label: 'Cosmos' },
  { value: 'Petunia', label: 'Petunia' },
  { value: 'Chrysanthemum', label: 'Chrysanthemum' },
  { value: 'Jasmine', label: 'Jasmine' },
  { value: 'Bougainvillea', label: 'Bougainvillea' },
  { value: 'Gladiolus', label: 'Gladiolus' },
  { value: 'Tulip', label: 'Tulip' },
  { value: 'Pansy', label: 'Pansy' },
  { value: 'Dianthus', label: 'Dianthus' },
  { value: 'Snapdragon', label: 'Snapdragon' },
  { value: 'Other', label: 'Other (Plant)' },
];

interface BloomResult {
  flowerName: string;
  sowingMonth: string;
  bloomMonth: string;
  endMonth: string;
  totalDays: number;
  data: typeof bloomData[string];
}

// Original addMonths function
function addMonths(monthName: string, monthsToAdd: number): string {
  const index = months.indexOf(monthName);
  return months[(index + monthsToAdd) % 12];
}

const BloomCalculator = () => {
  const { toast } = useToast();
  const [flowerName, setFlowerName] = useState("");
  const [customFlowerName, setCustomFlowerName] = useState("");
  const [sowingMonth, setSowingMonth] = useState("");
  const [result, setResult] = useState<BloomResult | null>(null);
  const [plantsDatabase, setPlantsDatabase] = useState<PlantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load PlantsDatabase.json
  useEffect(() => {
    const loadPlantsDatabase = async () => {
      try {
        const response = await fetch("/assets/Data/PlantsDatabase.json");
        const data: PlantsDatabase = await response.json();
        setPlantsDatabase(data.Plants || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load plants database:", error);
        setIsLoading(false);
        toast({
          title: "Warning",
          description: "Could not load plants database. Using fallback data.",
          variant: "destructive",
        });
      }
    };
    loadPlantsDatabase();
  }, [toast]);

  // Find plant in database (case-insensitive, partial match with auto-correct)
  const findPlantInDatabase = (searchName: string): { plant: PlantData | null; suggestedName?: string } => {
    const normalizedSearch = searchName.toLowerCase().trim();
    
    if (!normalizedSearch) {
      return { plant: null };
    }
    
    // Exact match first
    let found = plantsDatabase.find(
      (p) => p.name.toLowerCase() === normalizedSearch
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Partial match if no exact match
    found = plantsDatabase.find(
      (p) => p.name.toLowerCase().includes(normalizedSearch) || 
             normalizedSearch.includes(p.name.toLowerCase())
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Try fuzzy matching using search-utils
    const allPlantNames = plantsDatabase.map(p => p.name);
    const { match: bestMatch } = findBestMatch(searchName, allPlantNames, 0.5);
    
    if (bestMatch) {
      const matchedPlant = plantsDatabase.find(p => p.name === bestMatch);
      if (matchedPlant) {
        return { plant: matchedPlant, suggestedName: bestMatch };
      }
    }
    
    return { plant: null };
  };

  // Convert plant data to bloom data format
  const convertPlantToBloomData = (plant: PlantData) => {
    // Estimate days based on growing months and bloom time
    const growingMonths = plant["Growing Months"].split(",").map(m => m.trim()).length;
    const estimatedDaysToMaturity = growingMonths * 30;
    const estimatedDaysToGermination = 7; // Default
    const estimatedBloomDuration = 60; // Default 2 months
    
    // Parse care instructions
    const careInstructions = plant["Care Instructions"]
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    return {
      daysToGermination: estimatedDaysToGermination,
      daysToMaturity: estimatedDaysToMaturity,
      bloomDuration: estimatedBloomDuration,
      care: careInstructions.length > 0 ? careInstructions : [
        `Region: ${plant.Region}`,
        `Season: ${plant.Season}`,
        `Sunlight: ${plant["Sunlight Needs"]}`,
        `Soil: ${plant["Soil Requirements"]}`,
      ],
    };
  };

  // Update flower options to include popular plants from database
  const getPopularPlants = () => {
    if (plantsDatabase.length === 0) return flowerOptions;
    
    const popularNames = [
      "Rose", "Marigold", "Sunflower", "Tulip", "Jasmine", 
      "Tomato", "Chili", "Brinjal", "Okra", "Cucumber",
      "Mango", "Banana", "Papaya", "Guava", "Lemon"
    ];
    
    const foundPlants = popularNames
      .map(name => findPlantInDatabase(name))
      .filter(result => result.plant !== null)
      .map(result => ({ value: result.plant!.name, label: result.plant!.name }));
    
    return [
      ...foundPlants.slice(0, 10),
      ...flowerOptions.filter(opt => opt.value !== "Other"),
      { value: "Other", label: "Other (Type plant name)" },
    ];
  };

  const calculateBloomTime = () => {
    let selectedFlower = flowerName;

    if (!selectedFlower || !sowingMonth) {
      toast({
        title: "Missing Information",
        description: "Please select both plant and sowing month",
        variant: "destructive",
      });
      return;
    }

    if (selectedFlower === "Other") {
      if (!customFlowerName.trim()) {
        toast({
          title: "Missing Plant Name",
          description: "Please enter a plant, fruit, or vegetable name",
          variant: "destructive",
        });
        return;
      }
      selectedFlower = customFlowerName.trim();
    }

    // Reset result when changing plant
    setResult(null);

    // Try to find in database first
    const { plant: plantData, suggestedName } = findPlantInDatabase(selectedFlower);
    
    let data;
    let displayName = selectedFlower;

    if (plantData) {
      // Use database data
      data = convertPlantToBloomData(plantData);
      displayName = plantData.name;
      
      // Show suggestion if name was corrected
      if (suggestedName && suggestedName !== selectedFlower) {
        toast({
          title: "Plant Found",
          description: `Did you mean "${suggestedName}"? Using that instead.`,
        });
      }
    } else {
      // Fallback to original bloomData
      const normalizedName = selectedFlower.charAt(0).toUpperCase() + selectedFlower.slice(1).toLowerCase();
      const fallbackData = bloomData[normalizedName];
      
      if (!fallbackData) {
        // Show suggestion if available
        const suggestionText = suggestedName 
          ? ` Did you mean "${suggestedName}"?`
          : "";
        toast({
          title: "Plant Not Found",
          description: `Data for "${selectedFlower}" is not available.${suggestionText} Please try a different name or select from the predefined list.`,
          variant: "destructive",
        });
        return;
      }
      
      data = fallbackData;
      displayName = normalizedName;
    }

    // Timeline calculation
    const totalDays = data.daysToGermination + data.daysToMaturity;
    const monthsToBloom = Math.ceil(totalDays / 30);
    const bloomMonth = addMonths(sowingMonth, monthsToBloom);
    const endMonth = addMonths(bloomMonth, Math.ceil(data.bloomDuration / 30));

    setResult({
      flowerName: displayName,
      sowingMonth,
      bloomMonth,
      endMonth,
      totalDays,
      data,
    });
  };

  const resetForm = () => {
    setFlowerName("");
    setCustomFlowerName("");
    setSowingMonth("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link 
            to="/tools" 
            className="inline-flex items-center text-primary hover:underline mb-6 font-medium"
          >
            ← Back to Tools Hub
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              🌺 Flower Bloom Time Calculator
            </h1>
            <p className="text-muted-foreground">
              Predict when your flowers will bloom based on variety and sowing time.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="flowerName">Select Plant (Flower/Vegetable/Fruit):</Label>
                <Select value={flowerName} onValueChange={(val) => {
                  setFlowerName(val);
                  setResult(null); // Reset result when changing selection
                  if (val !== "Other") {
                    setCustomFlowerName("");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Plant --" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Loading plants...</SelectItem>
                    ) : (
                      getPopularPlants().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {flowerName === "Other" && (
                  <Input
                    type="text"
                    placeholder="Enter plant, vegetable, or fruit name (e.g., Tomato, Mango, Rose)"
                    value={customFlowerName}
                    onChange={(e) => {
                      setCustomFlowerName(e.target.value);
                      setResult(null); // Reset result when typing
                    }}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sowingMonth">Sowing Month:</Label>
                <Select value={sowingMonth} onValueChange={(val) => {
                  setSowingMonth(val);
                  setResult(null); // Reset result when changing month
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Month --" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={calculateBloomTime} className="flex-1 sm:flex-none">
                Calculate Bloom Time
              </Button>
              <Button onClick={resetForm} variant="secondary" className="flex-1 sm:flex-none">
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-primary mb-4">
                🌺 {result.flowerName} Bloom Timeline
              </h2>

              <h3 className="font-semibold text-foreground mb-4">📅 Bloom Timeline</h3>

              <div className="bg-primary/5 rounded-lg p-4 space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <strong className="text-primary block">Sowing Month</strong>
                    <span className="text-muted-foreground text-sm">{result.sowingMonth}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <strong className="text-primary block">Germination</strong>
                    <span className="text-muted-foreground text-sm">{result.data.daysToGermination} days</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌸</span>
                  <div>
                    <strong className="text-primary block">Bloom Start</strong>
                    <span className="text-muted-foreground text-sm">{result.bloomMonth} (~{result.totalDays} days)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">💐</span>
                  <div>
                    <strong className="text-primary block">Bloom Duration</strong>
                    <span className="text-muted-foreground text-sm">{result.data.bloomDuration} days</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🍂</span>
                  <div>
                    <strong className="text-primary block">Bloom End</strong>
                    <span className="text-muted-foreground text-sm">Around {result.endMonth}</span>
                  </div>
                </div>
              </div>

              {/* Care Tips */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">🌿 Essential Care Tips</h4>
                <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
                  {result.data.care.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BloomCalculator;
