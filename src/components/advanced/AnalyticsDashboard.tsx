import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Star, 
  Tag,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useStore } from '../../store/useStore';

export default function AnalyticsDashboard() {
  const { content, settings } = useStore();
  const analytics = useAnalytics(content);

  const stats = [
    {
      label: 'Total Items',
      value: analytics.totalItems,
      icon: BarChart3,
      color: 'text-primary bg-black/10 dark:bg-white/10',
    },
    {
      label: 'This Week',
      value: analytics.itemsThisWeek,
      icon: Calendar,
      color: 'text-primary bg-black/10 dark:bg-white/10',
    },
    {
      label: 'Favorites',
      value: analytics.favoriteItems,
      icon: Star,
      color: 'text-primary bg-black/10 dark:bg-white/10',
    },
    {
      label: 'Unique Tags',
      value: analytics.topTags.length,
      icon: Tag,
      color: 'text-primary bg-black/10 dark:bg-white/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <IconComponent size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Top Categories
          </h3>
          {analytics.topCategories.length === 0 && (
            <p className="text-secondary text-sm py-6 text-center">Add content to see category breakdowns.</p>
          )}
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                    settings.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-primary capitalize">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-20 h-2 rounded-full overflow-hidden ${
                    settings.theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
                  }`}>
                    <div 
                      className={`h-full rounded-full ${
                        settings.theme === 'dark' ? 'bg-white' : 'bg-black'
                      }`}
                      style={{ width: `${(category.count / Math.max(1, analytics.totalItems)) * 100}%` }}
                    />
                  </div>
                  <span className="text-secondary text-sm w-8">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Activity (Last 30 Days)
          </h3>
          <div className="flex items-end justify-between h-32 gap-1">
            {analytics.activityData.slice(-14).map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t-sm min-h-[4px] ${
                    settings.theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  style={{ height: `${Math.max(4, (day.count / Math.max(1, ...analytics.activityData.map(d => d.count))) * 100)}%` }}
                />
                <span className="text-xs text-muted mt-2">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag size={20} className="text-primary" />
          Popular Tags
        </h3>
        {analytics.topTags.length === 0 && (
          <p className="text-secondary text-sm py-6 text-center">Tags will appear here as your library grows.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {analytics.topTags.map((tag) => (
            <span
              key={tag.name}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-primary ${
                settings.theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-black/10 border border-black/20'
              }`}
            >
              <span>{tag.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                settings.theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
              }`}>{tag.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}