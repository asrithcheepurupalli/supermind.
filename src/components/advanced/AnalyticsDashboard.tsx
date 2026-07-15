import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Star,
  Tag,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useStore } from '../../store/useStore';

export default function AnalyticsDashboard() {
  const { content } = useStore();
  const analytics = useAnalytics(content);

  const stats = [
    { label: 'Total Items', value: analytics.totalItems, icon: BarChart3 },
    { label: 'This Week', value: analytics.itemsThisWeek, icon: Calendar },
    { label: 'Favorites', value: analytics.favoriteItems, icon: Star },
    { label: 'Unique Tags', value: analytics.topTags.length, icon: Tag },
  ];

  const recentActivity = analytics.activityData.slice(-14);
  const maxActivity = Math.max(1, ...recentActivity.map(d => d.count));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <IconComponent size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            Top Categories
          </h3>
          {analytics.topCategories.length === 0 ? (
            <p className="text-secondary text-sm py-8 text-center">Add content to see category breakdowns.</p>
          ) : (
            <div className="space-y-4">
              {analytics.topCategories.map((category) => (
                <div key={category.name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-primary text-sm font-medium capitalize">{category.name}</span>
                    <span className="text-secondary text-sm tabular-nums">{category.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden chart-bar-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.count / Math.max(1, analytics.topCategories[0].count)) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full chart-fill"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-5 flex items-center gap-2">
            <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
            Items Added (Last 14 Days)
          </h3>
          <div className="flex items-end h-36 gap-[3px] border-b border-black/10 dark:border-white/10 pb-px">
            {recentActivity.map((day) => {
              const date = new Date(day.date);
              const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={day.date} className="group relative flex-1 flex flex-col justify-end h-full">
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                    {label}: <span className="font-semibold tabular-nums">{day.count}</span>
                  </div>
                  <motion.div
                    initial={{ height: '3%' }}
                    animate={{ height: `${Math.max(3, (day.count / maxActivity) * 100)}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full chart-bar ${day.count === 0 ? 'opacity-25' : ''}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted">
            <span>{new Date(recentActivity[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>{new Date(recentActivity[recentActivity.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Tag size={18} className="text-emerald-600 dark:text-emerald-400" />
          Popular Tags
        </h3>
        {analytics.topTags.length === 0 ? (
          <p className="text-secondary text-sm py-6 text-center">Tags will appear here as your library grows.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-primary text-sm"
              >
                <span>{tag.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 tabular-nums">
                  {tag.count}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
