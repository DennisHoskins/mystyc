import SummaryPanel from "./SummaryPanel";
import { Bell, Database, Gauge, MoonStar, Satellite, Sparkle } from "lucide-react";

export default function Summary() {
  return (
    <div className="pt-20 pb-4 max-w-content w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
      <SummaryPanel 
        icon={<MoonStar className="w-10 h-10 text-white" />}  
        label='Comprehensive Astrology Engine' 
        text='Full astrological system with detailed compatibility algorithms that generate valuable metrics'
      />
      <SummaryPanel 
        icon={<Satellite className="w-10 h-10 text-white" />}
        label='Scientifically Accurate Calculations'
        text='Celestial movements are tracked using Swiss Ephemeris for degree-precise aspect calculations'
      />
      <SummaryPanel 
        icon={<Sparkle className="w-10 h-10 text-white" />}
        label='AI Analysis &amp; Summary'
        text='Integrated AI astrologer analyzes your charts and provides useful summaries in easy-to-understand terms'
      />
      <SummaryPanel
        icon={<Database className="w-10 h-10 text-white" />}
        label='Rich Knowledge Database'
        text='Includes all major astrological concepts: Signs, planets, elements, modalities, houses, interactions, and more'
      />
      <SummaryPanel
        icon={<Gauge className="w-10 h-10 text-white" />}
        label='Analytics Dashboards'
        text='Handy charts and graphs make it easy for you to get a quick overview view of your place in the universe'
      />
      <SummaryPanel
        icon={<Bell className="w-10 h-10 text-white" />}
        label='Daily Notifications'
        text='Never miss an update. Receive an alert every morning when your daily energy insights are ready'
      />
    </div>
  );
}