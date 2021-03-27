package handler

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func buildChromeDownloadLink(extensionId string) string {
	const baseUrl = "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D__EXTENSION_ID__%26installsource%3Dondemand%26uc"
	return strings.ReplaceAll(baseUrl, "__EXTENSION_ID__", extensionId)
}

func getCrx(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	url := buildChromeDownloadLink(id)
	resp, err := http.Get(url)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_, _ = io.Copy(w, resp.Body)
}

func buildMozillaDownloadLink(addonAccountId, addonName string) string {
	url := "https://addons.mozilla.org/firefox/downloads/latest/__ADDON_NAME__/addon-__ADDON_ACCOUNT_ID__-latest.xpi"
	url = strings.ReplaceAll(url, "__ADDON_ACCOUNT_ID__", addonAccountId)
	return strings.ReplaceAll(url, "__ADDON_NAME__", addonName)
}

func getXpi(w http.ResponseWriter, r *http.Request) {
	rawUrl, err := url.QueryUnescape(r.URL.Query().Get("url"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	fmt.Println(rawUrl)
	url, err := url.Parse(rawUrl)
	if err != nil || url.Host != "addons.mozilla.org" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	pathParts := strings.Split(strings.TrimSuffix(url.Path, "/"), "/")
	if len(pathParts) < 1 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	extId := pathParts[len(pathParts)-1]

	storePage, err := http.Get(url.String())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	doc, err := goquery.NewDocumentFromReader(storePage.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	author := doc.Find(".AddonTitle-author a").Text()
	if err != nil || author == "" {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	xpiURL := buildMozillaDownloadLink(author,extId)
	resp, err := http.Get(xpiURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_, _ = io.Copy(w, resp.Body)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/api/getcrx":
		getCrx(w,r)
		return
	case "/api/getxpi":
		getXpi(w,r)
		return
	default:
		w.WriteHeader(http.StatusNotFound)
	}
}
