package main

import (
	"embed"
	"encoding/csv"
	"fmt"
	"io/fs"
	"log"
	"strconv"
	"strings"

	"github.com/lubasinkal/v-star/pkg/mortality"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed tables/*.csv
var tableFiles embed.FS

func loadEmbeddedTables(app *App) {
	entries, err := fs.ReadDir(tableFiles, "tables")
	if err != nil {
		log.Printf("warning: no embedded tables found: %v", err)
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		data, err := fs.ReadFile(tableFiles, "tables/"+entry.Name())
		if err != nil {
			log.Printf("warning: failed to read %s: %v", entry.Name(), err)
			continue
		}

		r := csv.NewReader(strings.NewReader(string(data)))
		rows, err := r.ReadAll()
		if err != nil {
			log.Printf("warning: failed to parse CSV %s: %v", entry.Name(), err)
			continue
		}
		if len(rows) < 2 {
			continue
		}

		// find column indices
		header := rows[0]
		ageIdx, qxIdx := -1, -1
		for i, col := range header {
			switch strings.TrimSpace(strings.ToLower(col)) {
			case "age":
				ageIdx = i
			case "qx":
				qxIdx = i
			}
		}
		if ageIdx < 0 || qxIdx < 0 {
			log.Printf("warning: %s missing age or qx column", entry.Name())
			continue
		}

		maxAge := 0
		for _, row := range rows[1:] {
			age, _ := strconv.Atoi(strings.TrimSpace(row[ageIdx]))
			if age > maxAge {
				maxAge = age
			}
		}

		qx := make([]float64, maxAge+1)
		for _, row := range rows[1:] {
			age, _ := strconv.Atoi(strings.TrimSpace(row[ageIdx]))
			q, _ := strconv.ParseFloat(strings.TrimSpace(row[qxIdx]), 64)
			if age >= 0 && age <= maxAge {
				qx[age] = q
			}
		}

		name := entry.Name()
		if idx := strings.LastIndex(name, "."); idx > 0 {
			name = name[:idx]
		}

		table := mortality.NewTable(name, qx)
		app.mortSvc.RegisterTable(name, table)
		log.Printf("loaded mortality table: %s (%d ages)", name, table.MaxAge()+1)
	}
}

func main() {
	app := NewApp()
	loadEmbeddedTables(app)

	err := wails.Run(&options.App{
		Title:  "v-desktop",
		Width:  1280,
		Height: 900,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 248, G: 249, B: 250, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		fmt.Println("Error:", err.Error())
	}
}
