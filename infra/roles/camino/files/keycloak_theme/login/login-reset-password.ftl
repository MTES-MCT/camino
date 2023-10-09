<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "form">
     <main class="fr-pt-md-14v" role="main" id="content">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <h1>Récupération de mot de passe sur Camino</h1>
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                            <div>
                                <form id="login-1760" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                                    <fieldset class="fr-fieldset" id="login-1760-fieldset" aria-labelledby="login-1760-fieldset-legend">
                                        <legend class="fr-fieldset__legend" id="login-1760-fieldset-legend">
                                            <h2>Récupérer le mot de passe de votre compte</h2>
                                        </legend>
                                        <div class="fr-fieldset__element">
                                            <p class="fr-text--sm">Description — Veuillez saisir l’adresse électronique associée à votre compte. Nous vous enverrons plus d’informations pour réinitialiser votre mot de passe.</p>
                                        </div>
                                        <div class="fr-fieldset__element">
                                        <#if messagesPerField.existsError('username')>
                                            <div class="fr-alert fr-alert--error fr-mb-3w">
                                                <h3 class="fr-alert__title">${kcSanitize(messagesPerField.getFirstError('username'))?no_esc}</h3>
                                            </div>
                                        </#if>
                                            <fieldset class="fr-fieldset" id="credentials">                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group">
                                                        <label class="fr-label" for="username-1757">
                                                            ${msg("email")}
                                                            <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
                                                        </label>
                                                        <input tabindex="1" autofocus class="fr-input" autocomplete="username" aria-required="true" name="username" id="username-1757" type="text"  value="${(login.username!'')}" aria-invalid="<#if messagesPerField.existsError('username')>true</#if>">
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </div>
                                        <div class="fr-fieldset__element">
                                            <ul class="fr-btns-group">
                                                <li>
                                                    <button tabindex="2" class="fr-mt-2v fr-btn" name="login" type="submit">
                                                        Valider
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="fr-fieldset__element">
                                        <a class='fr-link fr-link--icon-left fr-icon-arrow-left-line' href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
    </#if>
</@layout.registrationLayout>
