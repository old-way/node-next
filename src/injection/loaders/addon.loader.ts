import { Addon, Injection } from "../interfaces";
import { InjectionLoader } from "./injection.loader";
import { InjectionType } from "@notadd/core/constants";
import { SettingService } from "@notadd/setting/services";
import { AddonCache } from "../interfaces";

export class AddonLoader extends InjectionLoader {
    protected cacheForAddons: Array<Addon> = [];

    protected filePathForCache = `${process.cwd()}/storages/caches/addon.json`;

    public get addons(): Array<Addon> {
        if (!this.cacheForAddons.length) {
            this.loadAddonsFromCache();
        }

        return this.cacheForAddons;
    }

    constructor() {
        super();
        this.loadAddonsFromCache();
    }

    public loadCachesFromJson(): AddonCache {
        return this.loadCachesFromJsonFile<AddonCache>(this.filePathForCache);
    }

    public refreshAddons() {
        this.cacheForAddons.splice(0, this.cacheForAddons.length);
    }

    public async syncWithSetting(setting: SettingService) {
        if (!this.cacheForAddons.length) {
            this.loadAddonsFromCache();
        }
        for(let i = 0; i < this.cacheForAddons.length; i ++) {
            const addon = this.cacheForAddons[i];
            const identification = addon.identification;
            addon.enabled = await setting.get(`addon.${identification}.enabled`, false);
            addon.installed = await setting.get(`addon.${identification}.installed`, false);
            this.cacheForAddons.splice(i, 1, addon);
        }

        this.syncCachesToFile();

        return this;
    }

    protected loadAddonsFromCache() {
        this.cacheForAddons.splice(0, this.cacheForAddons.length);
        this.cacheForAddons = this
            .injections
            .filter((injection: Injection) => {
                return InjectionType.Addon === Reflect.getMetadata("__injection_type__", injection.target);
            })
            .map((injection: Injection) => {
                return {
                    authors: Reflect.getMetadata("authors", injection.target),
                    description: Reflect.getMetadata("description", injection.target),
                    enabled: false,
                    identification: Reflect.getMetadata("identification", injection.target),
                    installed: false,
                    location: injection.location,
                    name: Reflect.getMetadata("name", injection.target),
                    version: Reflect.getMetadata("version", injection.target),
                };
            });
    }

    protected syncCachesToFile() {
        const caches = this.loadCachesFromJson();
        const exists: Array<string> = caches.enabled ? caches.enabled : [];
        const locations = this.addons.filter((addon: Addon) => {
            return addon.enabled === true;
        }).map((addon: Addon) => {
            return addon.location;
        });
        if (this.hasDiffBetweenArrays(exists, locations)) {
            caches.enabled = locations;
            this.writeCachesToFile(this.filePathForCache, caches);
        }
    }
}

export const Addon = new AddonLoader();
