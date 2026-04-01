import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrochurePage from "../components/BrochurePage";
import ImageViewer from "../components/ImageViewer";
import { fetchParksidePages } from "../api/client";

const SOURCES = ["lidl", "kaufland"];
const LOGOS = {
  lidl: require("../../assets/lidl-logo.png"),
  kaufland: require("../../assets/kaufland-logo.png"),
};

/**
 * Pair up items into rows of 2 for grid display.
 * Each "row" object has { row: [page, page?], key: string }.
 */
function pairItems(items) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push({
      row: items.slice(i, i + 2),
      key: `row-${items[i].brochure_id}-${items[i].page_number}`,
    });
  }
  return rows;
}

export default function HomeScreen() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSource, setActiveSource] = useState("lidl");
  const [activeBrochureId, setActiveBrochureId] = useState(null);
  const [viewerPage, setViewerPage] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchParksidePages();
      setPages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPages();
  }, [loadPages]);

  // Group pages by source → brochures
  const grouped = useMemo(() => {
    const map = { lidl: [], kaufland: [] };
    const seen = {};
    for (const page of pages) {
      const src = page.source || "lidl";
      const bid = page.brochure_id;
      if (!seen[bid]) {
        seen[bid] = { brochureId: bid, title: page.title, dateRange: page.date_range, source: src, allPages: [] };
        if (map[src]) map[src].push(seen[bid]);
      }
      seen[bid].allPages.push(page);
    }
    return map;
  }, [pages]);

  // Auto-select first brochure when switching source
  const brochures = grouped[activeSource] || [];
  useEffect(() => {
    if (brochures.length > 0 && !brochures.find((b) => b.brochureId === activeBrochureId)) {
      setActiveBrochureId(brochures[0].brochureId);
    }
  }, [activeSource, brochures, activeBrochureId]);

  const activeBrochure = brochures.find((b) => b.brochureId === activeBrochureId);
  const rows = activeBrochure ? pairItems(activeBrochure.allPages) : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a7a2e" />
        <Text style={styles.loadingText}>Loading Parkside pages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Could not load brochures</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Text style={styles.retry} onPress={loadPages}>
          Tap to retry
        </Text>
      </View>
    );
  }

  if (pages.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔧</Text>
          <Text style={styles.emptyText}>
            No Parkside pages found in current brochures
          </Text>
          <Text style={styles.retry} onPress={loadPages}>
            Tap to refresh
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.titleBar}>
        <Text style={styles.titleBarText}>🔧 Актуални Parkside предложения</Text>
      </View>

      {/* Source tabs */}
      <View style={styles.sourceTabs}>
        {SOURCES.map((src) => (
          <TouchableOpacity
            key={src}
            style={[styles.sourceTab, activeSource === src && styles.sourceTabActive]}
            onPress={() => setActiveSource(src)}
            activeOpacity={0.7}
          >
            <Image source={LOGOS[src]} style={styles.sourceLogo} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Date picker */}
      {brochures.length > 0 && (
        <View style={styles.datePickerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePicker}
          >
          {brochures.map((b) => (
            <TouchableOpacity
              key={b.brochureId}
              style={[styles.dateChip, activeBrochureId === b.brochureId && styles.dateChipActive]}
              onPress={() => setActiveBrochureId(b.brochureId)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateChipText, activeBrochureId === b.brochureId && styles.dateChipTextActive]}>
                {b.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>
      )}

      {brochures.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No Parkside pages from {activeSource}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.row.map((page) => (
                <BrochurePage
                  key={`${page.brochure_id}-${page.page_number}`}
                  page={page}
                  onPress={setViewerPage}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#1a7a2e" />
          }
        />
      )}

      <ImageViewer page={viewerPage} visible={!!viewerPage} onClose={() => setViewerPage(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  titleBar: {
    backgroundColor: "#1a7a2e",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  titleBarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 16,
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  sourceTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sourceTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    opacity: 0.4,
  },
  sourceTabActive: {
    opacity: 1,
    borderBottomWidth: 3,
    borderBottomColor: "#1a7a2e",
  },
  sourceLogo: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  datePicker: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerContainer: {
    backgroundColor: "#ebebeb",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e8e8e8",
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: "#1a7a2e",
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  dateChipTextActive: {
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#ebebeb",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  errorDetail: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  retry: {
    marginTop: 16,
    color: "#1a7a2e",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
});
