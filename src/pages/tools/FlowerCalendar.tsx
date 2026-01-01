import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";

// Indian regions with climate characteristics
const regions = [
  { id: "north", name: "North India", climate: "Cold winters, hot summers", examples: "Delhi, Punjab, UP, Rajasthan" },
  { id: "south", name: "South India", climate: "Tropical, warm year-round", examples: "Tamil Nadu, Kerala, Karnataka, Andhra Pradesh" },
  { id: "east", name: "East India", climate: "Humid, moderate winters", examples: "West Bengal, Odisha, Bihar, Jharkhand" },
  { id: "west", name: "West India", climate: "Hot, dry summers, coastal humidity", examples: "Maharashtra, Gujarat, Goa" },
  { id: "central", name: "Central India", climate: "Hot summers, mild winters", examples: "Madhya Pradesh, Chhattisgarh" },
  { id: "northeast", name: "Northeast India", climate: "Heavy rainfall, mild temperatures", examples: "Assam, Meghalaya, Sikkim" },
  { id: "hills", name: "Himalayan Region", climate: "Cold, alpine conditions", examples: "Himachal, Uttarakhand, J&K" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface FlowerData {
  name: string;
  emoji: string;
  sunlight: string;
  water: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  bloomTime: string;
  description: string;
}

interface MonthData {
  season: string;
  seasonEmoji: string;
  flowers: FlowerData[];
  tips: string[];
  regionNotes: Record<string, string>;
}

// Comprehensive flower planting data by month
const calendarData: Record<string, MonthData> = {
  January: {
    season: "Winter",
    seasonEmoji: "❄️",
    flowers: [
      { name: "Sweet Pea", emoji: "🌸", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-75 days", description: "Fragrant climbing flowers perfect for winter gardens" },
      { name: "Pansy", emoji: "🌺", sunlight: "Partial Shade", water: "Regular", difficulty: "Easy", bloomTime: "45-60 days", description: "Colorful, cold-tolerant flowers with distinctive patterns" },
      { name: "Larkspur", emoji: "💜", sunlight: "Full Sun", water: "Moderate", difficulty: "Moderate", bloomTime: "80-90 days", description: "Tall spikes of blue, pink, or white flowers" },
      { name: "Antirrhinum", emoji: "🌷", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "70-80 days", description: "Snapdragons with unique jaw-shaped blooms" },
      { name: "Calendula", emoji: "🌼", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "45-55 days", description: "Bright orange/yellow medicinal flowers" },
    ],
    tips: [
      "Protect seedlings from morning frost with covers",
      "Water only when soil surface is dry",
      "Add mulch around plants to retain warmth",
      "Start seeds indoors for early spring blooms"
    ],
    regionNotes: {
      north: "Peak winter - protect from frost, use row covers",
      south: "Best planting season - mild weather ideal for most flowers",
      east: "Cool and foggy - ensure good drainage",
      west: "Pleasant weather - ideal for winter annuals",
      central: "Cold nights - mulch heavily",
      northeast: "Mild and moist - watch for fungal issues",
      hills: "Very cold - focus on cold-hardy varieties only"
    }
  },
  February: {
    season: "Late Winter",
    seasonEmoji: "🌸",
    flowers: [
      { name: "Phlox", emoji: "💮", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "50-60 days", description: "Clusters of fragrant star-shaped flowers" },
      { name: "Verbena", emoji: "🌺", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "60-70 days", description: "Spreading habit with colorful flower clusters" },
      { name: "Petunia", emoji: "🌸", sunlight: "Full Sun", water: "Regular", difficulty: "Easy", bloomTime: "45-60 days", description: "Trumpet-shaped flowers in many colors" },
      { name: "Gazania", emoji: "🌻", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "50-60 days", description: "Daisy-like flowers that close at night" },
      { name: "Dianthus", emoji: "🌷", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-55 days", description: "Sweet-scented carnation family flowers" },
    ],
    tips: [
      "Begin fertilizing with liquid organic mix",
      "Use cocopeat + compost mix for pots",
      "Prepare beds for spring planting",
      "Transplant winter seedlings to larger containers"
    ],
    regionNotes: {
      north: "Winter ending - start preparing spring beds",
      south: "Continue winter planting, harvest early blooms",
      east: "Fog clearing - increase watering gradually",
      west: "Warming up - shift to heat-tolerant varieties",
      central: "Pleasant weather - best planting window",
      northeast: "Dry season starting - water regularly",
      hills: "Still cold - continue with cold-hardy plants"
    }
  },
  March: {
    season: "Spring",
    seasonEmoji: "🌷",
    flowers: [
      { name: "Marigold", emoji: "🌼", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-50 days", description: "Classic garden flower, pest-repelling properties" },
      { name: "Alyssum", emoji: "🤍", sunlight: "Partial Shade", water: "Moderate", difficulty: "Easy", bloomTime: "40-50 days", description: "Low-growing with honey-scented clusters" },
      { name: "Salvia", emoji: "🔴", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "60-70 days", description: "Spikes of red, blue, or purple flowers" },
      { name: "Gerbera", emoji: "🌸", sunlight: "Partial Shade", water: "Regular", difficulty: "Moderate", bloomTime: "90-120 days", description: "Large colorful daisy-like flowers" },
      { name: "Hollyhock", emoji: "🌺", sunlight: "Full Sun", water: "Moderate", difficulty: "Moderate", bloomTime: "120-150 days", description: "Tall spires of cup-shaped flowers" },
    ],
    tips: [
      "Pinch faded blooms to encourage more flowers",
      "Apply neem oil spray to prevent aphids",
      "Increase watering as temperatures rise",
      "Start summer flower seeds indoors"
    ],
    regionNotes: {
      north: "Spring arrives - perfect planting weather",
      south: "Getting warm - shift to heat-tolerant plants",
      east: "Warm and pleasant - ideal growing conditions",
      west: "Heating up - water in early morning only",
      central: "Good planting month - moderate temperatures",
      northeast: "Pre-monsoon - prepare for heavy rains",
      hills: "Spring blooms starting - enjoy the colors"
    }
  },
  April: {
    season: "Summer",
    seasonEmoji: "☀️",
    flowers: [
      { name: "Zinnia", emoji: "🌺", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Heat-loving with vibrant double blooms" },
      { name: "Sunflower", emoji: "🌻", sunlight: "Full Sun", water: "Regular", difficulty: "Easy", bloomTime: "70-80 days", description: "Cheerful giants that follow the sun" },
      { name: "Cosmos", emoji: "💮", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "50-60 days", description: "Delicate daisy-like flowers, drought-tolerant" },
      { name: "Portulaca", emoji: "🌸", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "40-50 days", description: "Succulent with vibrant rose-like flowers" },
      { name: "Amaranthus", emoji: "🔴", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "60-70 days", description: "Dramatic drooping flower tassels" },
    ],
    tips: [
      "Water early morning to prevent evaporation",
      "Mulch heavily to retain soil moisture",
      "Provide afternoon shade for delicate plants",
      "Use terracotta pots for natural cooling"
    ],
    regionNotes: {
      north: "Getting hot - water twice daily if needed",
      south: "Peak heat - only plant heat-tolerant varieties",
      east: "Hot and humid - watch for pest infestations",
      west: "Very hot - essential to mulch and shade",
      central: "Hot summer begins - reduce planting activity",
      northeast: "Pre-monsoon heat - prepare drainage systems",
      hills: "Pleasant spring - best planting season"
    }
  },
  May: {
    season: "Peak Summer",
    seasonEmoji: "🔥",
    flowers: [
      { name: "Vinca (Periwinkle)", emoji: "🌸", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "40-50 days", description: "Extremely heat and drought tolerant" },
      { name: "Tithonia", emoji: "🧡", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "70-80 days", description: "Mexican sunflower with orange blooms" },
      { name: "Celosia", emoji: "🔴", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Unique brain-like or feathery blooms" },
      { name: "Gaillardia", emoji: "🌼", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "60-75 days", description: "Blanket flower with fiery colors" },
      { name: "Cockscomb", emoji: "❤️", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Velvet-textured crested flowers" },
    ],
    tips: [
      "Use terracotta pots for natural cooling effect",
      "Provide partial shade in afternoon",
      "Water deeply but less frequently",
      "Avoid fertilizing during peak heat"
    ],
    regionNotes: {
      north: "Extreme heat - focus on hardy survivors only",
      south: "Hot and dry - minimal planting recommended",
      east: "Humid heat - fungal prevention important",
      west: "Scorching - only drought-tolerant plants",
      central: "Very hot - pause most planting activities",
      northeast: "Monsoon approaching - prepare for rains",
      hills: "Beautiful weather - continue spring planting"
    }
  },
  June: {
    season: "Pre-Monsoon",
    seasonEmoji: "🌧️",
    flowers: [
      { name: "Rain Lily", emoji: "🌸", sunlight: "Partial Shade", water: "Regular", difficulty: "Easy", bloomTime: "After first rain", description: "Magical blooms appear after monsoon showers" },
      { name: "Cleome", emoji: "💜", sunlight: "Full Sun", water: "Moderate", difficulty: "Moderate", bloomTime: "70-80 days", description: "Spider flower with unique bloom shape" },
      { name: "Nasturtium", emoji: "🧡", sunlight: "Partial Shade", water: "Moderate", difficulty: "Easy", bloomTime: "50-60 days", description: "Edible flowers with peppery taste" },
      { name: "Torenia", emoji: "💙", sunlight: "Partial Shade", water: "Regular", difficulty: "Easy", bloomTime: "45-55 days", description: "Wishbone flower loves humid conditions" },
      { name: "Crossandra", emoji: "🧡", sunlight: "Partial Shade", water: "Regular", difficulty: "Easy", bloomTime: "60-70 days", description: "Firecracker flower loves monsoon humidity" },
    ],
    tips: [
      "Ensure excellent drainage in all containers",
      "Fertilize lightly before heavy monsoon rains",
      "Plant monsoon-loving bulbs now",
      "Prepare rain shelters for delicate flowers"
    ],
    regionNotes: {
      north: "Monsoon approaching - prepare drainage",
      south: "Southwest monsoon starts - ideal for rain lovers",
      east: "Monsoon season begins - excellent for planting",
      west: "Heavy rains expected - ensure drainage",
      central: "Monsoon arriving - great planting opportunity",
      northeast: "Heavy rainfall - protect from waterlogging",
      hills: "Monsoon mists - humidity-loving plants thrive"
    }
  },
  July: {
    season: "Monsoon",
    seasonEmoji: "🌦️",
    flowers: [
      { name: "Balsam", emoji: "🌺", sunlight: "Partial Shade", water: "Self-sufficient", difficulty: "Easy", bloomTime: "45-55 days", description: "Touch-me-not that thrives in rain" },
      { name: "Gomphrena", emoji: "💜", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Globe amaranth with papery blooms" },
      { name: "Impatiens", emoji: "🌸", sunlight: "Full Shade", water: "Regular", difficulty: "Easy", bloomTime: "40-50 days", description: "Perfect for shady monsoon gardens" },
      { name: "Coleus", emoji: "🍃", sunlight: "Partial Shade", water: "Regular", difficulty: "Easy", bloomTime: "Foliage plant", description: "Colorful foliage in vibrant patterns" },
      { name: "Begonia", emoji: "🌺", sunlight: "Partial Shade", water: "Moderate", difficulty: "Moderate", bloomTime: "60-70 days", description: "Beautiful foliage and delicate blooms" },
    ],
    tips: [
      "Don't over-fertilize during monsoon",
      "Stake tall varieties for wind protection",
      "Check daily for waterlogging issues",
      "Remove fallen leaves to prevent fungal growth"
    ],
    regionNotes: {
      north: "Peak monsoon - excellent growing conditions",
      south: "Heavy rains - monitor drainage constantly",
      east: "Flooding risk - raised beds recommended",
      west: "Heavy coastal rains - protect from salt spray",
      central: "Good rainfall - plants thrive naturally",
      northeast: "Very heavy rains - shelter delicate plants",
      hills: "Landslide season - container gardening safer"
    }
  },
  August: {
    season: "Monsoon",
    seasonEmoji: "🌿",
    flowers: [
      { name: "Rain Lily", emoji: "🌸", sunlight: "Partial Shade", water: "Rain-sufficient", difficulty: "Easy", bloomTime: "Immediate after rain", description: "Peak blooming season for these beauties" },
      { name: "Amaranthus", emoji: "🔴", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Love lies bleeding with cascading flowers" },
      { name: "Butterfly Pea", emoji: "💙", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "90-120 days", description: "Blue flowers used for tea, climbing vine" },
      { name: "Canna", emoji: "🔴", sunlight: "Full Sun", water: "Heavy", difficulty: "Easy", bloomTime: "60-90 days", description: "Tropical blooms with large leaves" },
      { name: "Tuberose", emoji: "🤍", sunlight: "Full Sun", water: "Regular", difficulty: "Moderate", bloomTime: "90-120 days", description: "Intensely fragrant night-blooming flowers" },
    ],
    tips: [
      "Watch out for fungal infections",
      "Spray neem solution weekly as prevention",
      "Remove yellowing leaves promptly",
      "Prepare for post-monsoon planting"
    ],
    regionNotes: {
      north: "Monsoon continues - lush green everywhere",
      south: "Rains reducing - prepare autumn flowers",
      east: "Still rainy - maintain drainage vigilance",
      west: "Rains decreasing - start autumn prep",
      central: "Late monsoon - good growing period",
      northeast: "Continuous rain - protect from rot",
      hills: "Misty and cool - perfect for ferns and shade plants"
    }
  },
  September: {
    season: "Late Monsoon",
    seasonEmoji: "🍁",
    flowers: [
      { name: "Coreopsis", emoji: "🌼", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "55-65 days", description: "Tickseed with cheerful yellow blooms" },
      { name: "Torenia", emoji: "💜", sunlight: "Partial Shade", water: "Moderate", difficulty: "Easy", bloomTime: "45-55 days", description: "Wishbone flower for shaded areas" },
      { name: "Celosia", emoji: "🔴", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Crested and plume varieties available" },
      { name: "Ageratum", emoji: "💙", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "50-60 days", description: "Fluffy blue flower clusters" },
      { name: "Dahlia", emoji: "🌸", sunlight: "Full Sun", water: "Regular", difficulty: "Moderate", bloomTime: "60-90 days", description: "Start tubers now for autumn blooms" },
    ],
    tips: [
      "Begin pruning monsoon growth",
      "Mix in cow dung compost for nutrients",
      "Start winter flower seeds indoors",
      "Reduce watering as monsoon recedes"
    ],
    regionNotes: {
      north: "Monsoon ending - perfect autumn prep time",
      south: "Transitioning - start winter flowers",
      east: "Rains reducing - revitalize soil",
      west: "Post-monsoon - ideal planting window",
      central: "Pleasant weather returning - expand garden",
      northeast: "Rains slowing - good planting opportunity",
      hills: "Autumn colors starting - prepare for cold"
    }
  },
  October: {
    season: "Autumn",
    seasonEmoji: "🌻",
    flowers: [
      { name: "Calendula", emoji: "🧡", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-55 days", description: "Pot marigold with medicinal properties" },
      { name: "Dahlia", emoji: "🌺", sunlight: "Full Sun", water: "Regular", difficulty: "Moderate", bloomTime: "60-90 days", description: "Stunning variety of colors and forms" },
      { name: "Chrysanthemum", emoji: "🌼", sunlight: "Full Sun", water: "Moderate", difficulty: "Moderate", bloomTime: "60-75 days", description: "Classic autumn flower for festivals" },
      { name: "Marigold", emoji: "🌼", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-50 days", description: "Essential for Diwali celebrations" },
      { name: "Cosmos", emoji: "💮", sunlight: "Full Sun", water: "Low", difficulty: "Easy", bloomTime: "50-60 days", description: "Graceful flowers on slender stems" },
    ],
    tips: [
      "Use 14:14:14 NPK fertilizer for blooms",
      "Morning sun is essential for flowering",
      "Plant now for Diwali flowers",
      "Protect from early morning dew"
    ],
    regionNotes: {
      north: "Perfect autumn weather - plant everything",
      south: "Post-monsoon - excellent planting time",
      east: "Pleasant and dry - ideal conditions",
      west: "Comfortable weather - garden expansion time",
      central: "Festive season prep - focus on marigolds",
      northeast: "Dry season - regular watering needed",
      hills: "Cold approaching - plant cold-hardy varieties"
    }
  },
  November: {
    season: "Early Winter",
    seasonEmoji: "🍂",
    flowers: [
      { name: "Aster", emoji: "💜", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "60-70 days", description: "Star-shaped flowers in many colors" },
      { name: "Snapdragon", emoji: "🌷", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "65-75 days", description: "Dragon-faced blooms kids love" },
      { name: "Dianthus", emoji: "💮", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-55 days", description: "Sweet-scented pinks and reds" },
      { name: "Stock", emoji: "🌸", sunlight: "Full Sun", water: "Moderate", difficulty: "Moderate", bloomTime: "70-80 days", description: "Intensely fragrant evening blooms" },
      { name: "Poppy", emoji: "🌺", sunlight: "Full Sun", water: "Low", difficulty: "Moderate", bloomTime: "80-90 days", description: "Delicate papery petals" },
    ],
    tips: [
      "Group plants based on water needs",
      "Add vermicompost for better blooms",
      "Protect from cold winds with barriers",
      "Reduce watering frequency"
    ],
    regionNotes: {
      north: "Winter setting in - protect tender plants",
      south: "Mild and pleasant - peak gardening season",
      east: "Cool and comfortable - excellent for flowers",
      west: "Pleasant weather - enjoy outdoor gardening",
      central: "Cooling down - winter flower paradise",
      northeast: "Dry and cool - water regularly",
      hills: "Getting cold - mulch heavily for insulation"
    }
  },
  December: {
    season: "Winter",
    seasonEmoji: "❄️",
    flowers: [
      { name: "Pansy", emoji: "🌸", sunlight: "Full Sun", water: "Moderate", difficulty: "Easy", bloomTime: "45-60 days", description: "Happy faced flowers in endless colors" },
      { name: "Lobelia", emoji: "💙", sunlight: "Partial Shade", water: "Regular", difficulty: "Moderate", bloomTime: "55-65 days", description: "Trailing blue flowers for edges" },
      { name: "Cyclamen", emoji: "💮", sunlight: "Partial Shade", water: "Moderate", difficulty: "Advanced", bloomTime: "60-90 days", description: "Elegant swept-back petals" },
      { name: "Primula", emoji: "🌸", sunlight: "Partial Shade", water: "Regular", difficulty: "Moderate", bloomTime: "50-60 days", description: "Colorful primrose clusters" },
      { name: "Viola", emoji: "💜", sunlight: "Partial Shade", water: "Moderate", difficulty: "Easy", bloomTime: "45-55 days", description: "Delicate cousin of pansy" },
    ],
    tips: [
      "Light morning watering only",
      "Protect from harsh fog with polythene covers",
      "Ensure good air circulation",
      "Prepare for January sowing"
    ],
    regionNotes: {
      north: "Peak winter - frost protection essential",
      south: "Best season - cool and comfortable",
      east: "Foggy mornings - water carefully",
      west: "Pleasant and cool - enjoy the garden",
      central: "Cold nights - protect from frost",
      northeast: "Dry and cold - maintain moisture levels",
      hills: "Very cold - only hardy alpines survive outdoors"
    }
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Moderate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
};

const FlowerCalendar = () => {
  const currentMonth = months[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedRegion, setSelectedRegion] = useState("north");

  const monthData = calendarData[selectedMonth];
  const regionInfo = regions.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4">
            <nav className="text-sm mb-4">
              <a href="/tools" className="text-muted-foreground hover:text-primary">Tools</a>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Flower Calendar</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              🌸 Seasonal Flower Planting Calendar
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Find the perfect flowers to plant each month in your region of India. Get detailed planting guidance tailored to your local climate.
            </p>
          </div>
        </section>

        {/* Selection Controls */}
        <section className="py-6 bg-muted/30 border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose month" />
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

              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Region
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Season & Region Info */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{monthData.seasonEmoji}</span>
                    {selectedMonth} - {monthData.season}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {monthData.regionNotes[selectedRegion]}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📍 {regionInfo?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Climate:</strong> {regionInfo?.climate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Includes:</strong> {regionInfo?.examples}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Flowers to Plant */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              🌼 Flowers to Plant in {selectedMonth}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthData.flowers.map((flower) => (
                <Card key={flower.name} className="hover:shadow-elegant transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{flower.emoji}</span>
                      {flower.name}
                    </CardTitle>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getDifficultyColor(flower.difficulty)}`}>
                      {flower.difficulty}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {flower.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span>☀️</span>
                        <span className="text-muted-foreground">{flower.sunlight}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💧</span>
                        <span className="text-muted-foreground">{flower.water}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <span>⏱️</span>
                        <span className="text-muted-foreground">Bloom: {flower.bloomTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-6 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              💡 {selectedMonth} Gardening Tips
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {monthData.tips.map((tip, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 bg-background p-4 rounded-lg border border-border"
                >
                  <span className="text-primary font-bold">✓</span>
                  <p className="text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">
              Explore Other Months
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedMonth === month
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Back to Tools */}
        <section className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <a 
              href="/tools" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              ← Back to All Tools
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default FlowerCalendar;
